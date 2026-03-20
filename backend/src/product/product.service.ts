import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[] = [],
  ) {
    const { variants: _variants, ...productPayload } = createProductDto;
    let variants: any[] = _variants || [];
    console.log(
      'Service Create DTO - Raw variants:',
      _variants,
      'Type:',
      typeof _variants,
    );

    // Parse variants if they come as a JSON string
    if (typeof _variants === 'string') {
      try {
        variants = JSON.parse(_variants);
        console.log('Parsed variants from string:', variants);
      } catch (e) {
        console.error('Failed to parse variants string:', e);
        variants = [];
      }
    } else if (Array.isArray(_variants)) {
      variants = _variants;
    } else {
      variants = [];
    }

    // Ensure variants is an array
    if (!Array.isArray(variants)) {
      variants = [];
    }

    // Filter out empty or invalid variants
    variants = variants.filter(
      (v) => v && typeof v === 'object' && v.sku && v.name_en && v.name_mm,
    );

    console.log('Normalized variants:', variants);

    const category = await this.prisma.category.findFirst({
      where: {
        OR: [
          { id: productPayload.categoryId },
          { slug: productPayload.categoryId },
        ],
      },
    });

    if (!category) {
      throw new BadRequestException('Invalid category supplied');
    }

    const uploadResults = files?.length
      ? await Promise.all(
          files.map((file) => this.cloudinary.uploadImage(file)),
        )
      : [];

    let parsedVariantMap: Record<string, number[]> = {};
    if (productPayload.variantImageMap) {
      try {
        parsedVariantMap = JSON.parse(productPayload.variantImageMap);
      } catch (e) {
        // ignore
      }
    }

    const allMappedIndices = new Set<number>();
    Object.values(parsedVariantMap).forEach((indices) => {
      indices.forEach((i) => allMappedIndices.add(i));
    });

    // productImages are those not mapped to any variant
    const productImages = [];
    let mainAssigned = false;
    for (let i = 0; i < uploadResults.length; i++) {
      if (!allMappedIndices.has(i)) {
        const result = uploadResults[i] as any;
        productImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: !mainAssigned,
        });
        mainAssigned = true;
      }
    }

    const normalizedStock = Number(productPayload.stock ?? 0);
    const normalizedPrice = Number(productPayload.price ?? 0);
    const normalizedAudience = productPayload.audience ?? 'all';

    const { variantImageMap: _, ...cleanPayload } = productPayload as any;

    const createdProduct = await this.prisma.product.create({
      data: {
        ...cleanPayload,
        price: normalizedPrice,
        stock: normalizedStock,
        audience: normalizedAudience,
        categoryId: category.id,
        images: productImages.length ? { create: productImages } : undefined,
        variants: variants.length
          ? {
              create: variants.map((variant, index) => ({
                sku: variant.sku || `VAR-${index + 1}`,
                name_en: variant.name_en,
                name_mm: variant.name_mm,
                priceOverride: variant.priceOverride ?? undefined,
                stock: Number(variant.stock ?? 0),
                options: variant.options?.length
                  ? {
                      create: variant.options.map((option: any) => ({
                        type: option.type,
                        value_en: option.value_en,
                        value_mm: option.value_mm,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    const variantImagesToCreate: any[] = [];
    if (Object.keys(parsedVariantMap).length > 0 && createdProduct.variants) {
      createdProduct.variants.forEach((v: any, index: number) => {
        const imgIndices = parsedVariantMap[index.toString()] || [];
        imgIndices.forEach((imgIdx: number) => {
          const result = uploadResults[imgIdx] as any;
          if (result) {
            variantImagesToCreate.push({
              url: result.secure_url,
              publicId: result.public_id,
              isMain: false,
              productId: createdProduct.id,
              variantId: v.id,
            });
          }
        });
      });

      if (variantImagesToCreate.length > 0) {
        await this.prisma.productImage.createMany({
          data: variantImagesToCreate,
        });
      }
    }

    return this.prisma.product.findUnique({
      where: { id: createdProduct.id },
      include: {
        images: true,
        category: true,
        brand: true,
        variants: {
          include: {
            options: true,
            images: true,
          },
        },
      },
    });
  }

  async findAll(search?: string) {
    let whereCondition = {};

    if (search) {
      const ftsQuery = search.trim().split(/\s+/).join(' | ');

      whereCondition = {
        OR: [
          { name_en: { search: ftsQuery } },
          { category: { name_en: { search: ftsQuery } } },

          { name_mm: { contains: search } },
          { category: { name_mm: { contains: search } } },
        ],
      };
    }

    return this.prisma.product.findMany({
      where: whereCondition,
      include: {
        images: true,
        category: true,
        brand: true,
        variants: {
          include: {
            options: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        brand: true,
        variants: {
          include: {
            options: true,
            images: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto = {} as any,
    files: Express.Multer.File[] = [],
  ) {
    console.log('Service Update DTO:', updateProductDto);
    updateProductDto = updateProductDto || ({} as any);
    const {
      categoryId,
      price,
      stock,
      variants: _variants,
      variantImageMap,
      ...rest
    } = updateProductDto;

    // Handle variants parsing (similar to create)
    let variants: any[] = [];
    if (_variants) {
      if (typeof _variants === 'string') {
        try {
          variants = JSON.parse(_variants);
        } catch (e) {
          variants = [];
        }
      } else {
        variants = _variants;
      }
    }

    if (!Array.isArray(variants)) {
      variants = [];
    }

    let resolvedCategoryId: string | undefined;
    if (categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          OR: [{ id: categoryId }, { slug: categoryId }],
        },
      });

      if (!category) {
        throw new BadRequestException('Invalid category supplied');
      }

      resolvedCategoryId = category.id;
    }

    // Upload new files
    const uploadResults = files?.length
      ? await Promise.all(
          files.map((file) => this.cloudinary.uploadImage(file)),
        )
      : [];

    let parsedVariantMap: Record<string, number[]> = {};
    if (variantImageMap) {
      try {
        parsedVariantMap = JSON.parse(variantImageMap);
      } catch (e) {
        // ignore
      }
    }

    const allMappedIndices = new Set<number>();
    Object.values(parsedVariantMap).forEach((indices) => {
      indices.forEach((i) => allMappedIndices.add(i));
    });

    const normalizedPrice =
      price === undefined || price === null ? undefined : Number(price);
    const normalizedStock =
      stock === undefined || stock === null ? undefined : Number(stock);

    const productImages: { url: string; publicId: string; isMain: boolean }[] =
      [];
    for (let i = 0; i < uploadResults.length; i++) {
      if (!allMappedIndices.has(i)) {
        const result = uploadResults[i] as any;
        productImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isMain: false,
        });
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Update product basic info
        const updatedProduct = await tx.product.update({
          where: { id },
          data: {
            ...rest,
            price: Number.isNaN(normalizedPrice) ? undefined : normalizedPrice,
            stock: Number.isNaN(normalizedStock) ? undefined : normalizedStock,
            categoryId: resolvedCategoryId,
            images: productImages.length
              ? { create: productImages }
              : undefined,
          },
        });

        if (variants.length > 0) {
          // Get current variants to handle deletions
          const currentVariants = await tx.productVariant.findMany({
            where: { productId: id },
            select: { id: true },
          });

          const currentIds = currentVariants.map((v) => v.id);
          const incomingIds = variants
            .filter((v) => v.id)
            .map((v) => v.id as string);

          const idsToDelete = currentIds.filter(
            (id) => !incomingIds.includes(id),
          );

          // Delete variants not in incoming list
          if (idsToDelete.length > 0) {
            await tx.productVariant.deleteMany({
              where: { id: { in: idsToDelete } },
            });
          }

          // Process incoming variants
          for (let index = 0; index < variants.length; index++) {
            const v = variants[index];
            const variantData = {
              sku: v.sku,
              name_en: v.name_en,
              name_mm: v.name_mm,
              priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
              stock: Number(v.stock ?? 0),
              productId: id,
            };

            let variantId = v.id;

            if (variantId) {
              // Update existing variant
              await tx.productVariant.update({
                where: { id: variantId },
                data: variantData,
              });

              // Update options (simplest way is delete and recreate for the variant)
              if (v.options) {
                await tx.variantOption.deleteMany({
                  where: { variantId },
                });
                if (v.options.length > 0) {
                  await tx.variantOption.createMany({
                    data: v.options.map((opt: any) => ({
                      type: opt.type,
                      value_en: opt.value_en,
                      value_mm: opt.value_mm,
                      variantId,
                    })),
                  });
                }
              }
            } else {
              // Create new variant
              const newV = await tx.productVariant.create({
                data: {
                  ...variantData,
                  options: v.options?.length
                    ? {
                        create: v.options.map((opt: any) => ({
                          type: opt.type,
                          value_en: opt.value_en,
                          value_mm: opt.value_mm,
                        })),
                      }
                    : undefined,
                },
              });
              variantId = newV.id;
            }

            // Handle images mapped to this variant (incoming index)
            const imgIndices = parsedVariantMap[index.toString()] || [];
            if (imgIndices.length > 0) {
              const variantImages = imgIndices
                .map((imgIdx) => uploadResults[imgIdx] as any)
                .filter((res) => !!res)
                .map((result) => ({
                  url: result.secure_url,
                  publicId: result.public_id,
                  isMain: false,
                  productId: id,
                  variantId: variantId,
                }));

              if (variantImages.length > 0) {
                await tx.productImage.createMany({
                  data: variantImages,
                });
              }
            }
          }
        }

        return tx.product.findUnique({
          where: { id },
          include: {
            images: true,
            category: true,
            brand: true,
            variants: {
              include: {
                options: true,
                images: true,
              },
            },
          },
        });
      });
    } catch (error) {
      console.error('Update error:', error);
      throw new NotFoundException('Product not found or update failed');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }
}
