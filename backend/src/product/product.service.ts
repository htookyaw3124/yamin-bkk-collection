import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadApiResponse } from 'cloudinary';

interface ParsedOption {
  type: string;
  value_en: string;
  value_mm: string;
  color?: string;
  imageUrl?: string;
}

interface ParsedVariant {
  id?: string;
  sku: string;
  name_en: string;
  name_mm: string;
  priceOverride?: number;
  stock: number;
  options?: ParsedOption[];
}

type ProductWithVariants = Prisma.ProductGetPayload<{
  include: { variants: true };
}>;

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

    const variants = this.parseVariantsPayload(_variants);
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

    const parsedVariantMap = this.parseVariantImageMap(
      productPayload.variantImageMap,
    );
    const parsedOptionMap = this.parseVariantImageMap(
      productPayload.optionImageMap,
    );
    const allMappedIndices = this.getMappedImageIndices(parsedVariantMap);
    const allMappedOptionIndices = this.getMappedImageIndices(parsedOptionMap);
    allMappedOptionIndices.forEach((i) => allMappedIndices.add(i));

    // productImages are those not mapped to any variant
    const productImages = [];
    let mainAssigned = false;
    for (let i = 0; i < uploadResults.length; i++) {
      if (!allMappedIndices.has(i)) {
        const result = uploadResults[i] as UploadApiResponse;
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

    const cleanPayload = { ...productPayload };
    // imageUrl is handled via destructuring or simply ignored if not in DTO

    const prismaCreateData = {
      name_en: cleanPayload.name_en,
      name_mm: cleanPayload.name_mm,
      description_en: cleanPayload.description_en,
      description_mm: cleanPayload.description_mm,
      price: normalizedPrice,
      stock: normalizedStock,
      audience: normalizedAudience,
      videoUrl: cleanPayload.videoUrl,
      variantGroups: cleanPayload.variantGroups as Prisma.InputJsonValue,
      categoryId: category.id,
      brandId: cleanPayload.brandId || null,
    };

    console.log('Prisma Create Data Summary:', {
      name: prismaCreateData.name_en,
      variantsCount: variants.length,
      imagesCount: productImages.length,
    });

    const createdProduct = (await this.prisma.product.create({
      data: {
        ...prismaCreateData,
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
                      create: variant.options.map(
                        (option: ParsedOption, optIndex: number) => {
                          let mappedUrl = option.imageUrl;
                          const optImgIndices =
                            parsedOptionMap[`${index}-${optIndex}`];
                          if (
                            optImgIndices &&
                            optImgIndices.length > 0 &&
                            uploadResults[optImgIndices[0]]
                          ) {
                            mappedUrl = (
                              uploadResults[
                                optImgIndices[0]
                              ] as UploadApiResponse
                            ).secure_url;
                          }
                          return {
                            type: option.type,
                            value_en: option.value_en,
                            value_mm: option.value_mm,
                            color: option.color,
                            imageUrl: mappedUrl,
                          };
                        },
                      ),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    })) as ProductWithVariants;

    const variantImagesToCreate: {
      url: string;
      publicId: string;
      isMain: boolean;
      productId: string;
      variantId: string;
    }[] = [];
    if (Object.keys(parsedVariantMap).length > 0 && createdProduct.variants) {
      createdProduct.variants.forEach((v, index: number) => {
        const imgIndices = parsedVariantMap[index.toString()] || [];
        imgIndices.forEach((imgIdx: number) => {
          const result = uploadResults[imgIdx] as UploadApiResponse;
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

  async findAll(search?: string, brandId?: string) {
    let whereCondition: Prisma.ProductWhereInput = {};

    if (brandId) {
      whereCondition.brandId = brandId;
    }

    if (search) {
      const ftsQuery = search.trim().split(/\s+/).join(' | ');

      whereCondition = {
        OR: [
          { name_en: { search: ftsQuery } },
          { category: { name_en: { search: ftsQuery } } },

          { name_mm: { contains: search } },
          { category: { name_mm: { contains: search } } },
          { description_en: { contains: search } },
          { description_mm: { contains: search } },
          { brand: { name: { search: search } } },
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
    updateProductDto: UpdateProductDto = {},
    files: Express.Multer.File[] = [],
  ) {
    console.log('Service Update DTO:', updateProductDto);
    const {
      categoryId,
      price,
      stock,
      variants: _variants,
      variantImageMap,
      optionImageMap,
      ...rest
    } = updateProductDto;

    // Handle variants parsing (similar to create)
    const variants = this.parseVariantsPayload(_variants);

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

    const parsedVariantMap = this.parseVariantImageMap(variantImageMap);
    const parsedOptionMap = this.parseVariantImageMap(optionImageMap);
    const allMappedIndices = this.getMappedImageIndices(parsedVariantMap);
    const allMappedOptionIndices = this.getMappedImageIndices(parsedOptionMap);
    allMappedOptionIndices.forEach((i) => allMappedIndices.add(i));

    const normalizedPrice =
      price === undefined || price === null ? undefined : Number(price);
    const normalizedStock =
      stock === undefined || stock === null ? undefined : Number(stock);

    const productImages: { url: string; publicId: string; isMain: boolean }[] =
      [];
    for (let i = 0; i < uploadResults.length; i++) {
      if (!allMappedIndices.has(i)) {
        const result = uploadResults[i] as UploadApiResponse;
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
        await tx.product.update({
          where: { id },
          data: {
            name_en: rest.name_en,
            name_mm: rest.name_mm,
            description_en: rest.description_en,
            description_mm: rest.description_mm,
            audience: rest.audience,
            videoUrl: rest.videoUrl,
            variantGroups: rest.variantGroups as Prisma.InputJsonValue,
            price: Number.isNaN(normalizedPrice) ? undefined : normalizedPrice,
            stock: Number.isNaN(normalizedStock) ? undefined : normalizedStock,
            brand: rest.brandId
              ? { connect: { id: rest.brandId } }
              : { disconnect: true }, // allow unsetting brand
            category: resolvedCategoryId
              ? { connect: { id: resolvedCategoryId } }
              : undefined,
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
                  const finalVariantId: string = variantId;
                  await tx.variantOption.createMany({
                    data: v.options.map(
                      (opt: ParsedOption, optIndex: number) => {
                        let mappedUrl = opt.imageUrl;
                        const optImgIndices =
                          parsedOptionMap[`${index}-${optIndex}`];
                        if (
                          optImgIndices &&
                          optImgIndices.length > 0 &&
                          uploadResults[optImgIndices[0]]
                        ) {
                          mappedUrl = (
                            uploadResults[optImgIndices[0]] as UploadApiResponse
                          ).secure_url;
                        }
                        return {
                          type: opt.type,
                          value_en: opt.value_en,
                          value_mm: opt.value_mm,
                          color: opt.color,
                          imageUrl: mappedUrl,
                          variantId: finalVariantId,
                        };
                      },
                    ),
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
                        create: v.options.map(
                          (opt: ParsedOption, optIndex: number) => {
                            let mappedUrl = opt.imageUrl;
                            const optImgIndices =
                              parsedOptionMap[`${index}-${optIndex}`];
                            if (
                              optImgIndices &&
                              optImgIndices.length > 0 &&
                              uploadResults[optImgIndices[0]]
                            ) {
                              mappedUrl = (
                                uploadResults[
                                  optImgIndices[0]
                                ] as UploadApiResponse
                              ).secure_url;
                            }
                            return {
                              type: opt.type,
                              value_en: opt.value_en,
                              value_mm: opt.value_mm,
                              color: opt.color,
                              imageUrl: mappedUrl,
                            };
                          },
                        ),
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
                .map((imgIdx) => uploadResults[imgIdx] as UploadApiResponse)
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
    } catch (_error) {
      console.error('Update error:', _error);
      throw new NotFoundException('Product not found or update failed');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  // --- Helpers ---
  private parseVariantsPayload(variantsData: unknown): ParsedVariant[] {
    let variants: ParsedVariant[] = [];
    if (variantsData) {
      if (typeof variantsData === 'string') {
        try {
          variants = JSON.parse(variantsData) as ParsedVariant[];
        } catch {
          variants = [];
        }
      } else if (Array.isArray(variantsData)) {
        variants = variantsData as ParsedVariant[];
      }
    }
    if (!Array.isArray(variants)) {
      variants = [];
    }
    return variants.filter(
      (v): v is ParsedVariant =>
        !!(v && typeof v === 'object' && v.sku && v.name_en && v.name_mm),
    );
  }

  private parseVariantImageMap(mapData?: string): Record<string, number[]> {
    if (!mapData) return {};
    try {
      return JSON.parse(mapData) as unknown as Record<string, number[]>;
    } catch {
      return {};
    }
  }

  private getMappedImageIndices(
    parsedMap: Record<string, number[]>,
  ): Set<number> {
    const allMappedIndices = new Set<number>();
    Object.values(parsedMap).forEach((indices) => {
      indices.forEach((i) => allMappedIndices.add(i));
    });
    return allMappedIndices;
  }
}
