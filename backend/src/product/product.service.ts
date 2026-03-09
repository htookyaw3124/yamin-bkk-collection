import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[] = []) {
    const { variants = [], ...productPayload } = createProductDto;

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
      ? await Promise.all(files.map(file => this.cloudinary.uploadImage(file)))
      : [];

    const productImages = uploadResults.map((result: any, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      isMain: index === 0,
    }));

    const normalizedStock = Number(productPayload.stock ?? 0);
    const normalizedPrice = Number(productPayload.price ?? 0);
    const normalizedAudience = productPayload.audience ?? 'all';

    return this.prisma.product.create({
      data: {
        ...productPayload,
        price: normalizedPrice,
        stock: normalizedStock,
        audience: normalizedAudience,
        categoryId: category.id,
        images: productImages.length ? { create: productImages } : undefined,
        variants: variants.length
          ? {
              create: variants.map(variant => ({
                sku: variant.sku,
                name_en: variant.name_en,
                name_mm: variant.name_mm,
                priceOverride: variant.priceOverride ?? undefined,
                stock: Number(variant.stock ?? 0),
                options: variant.options?.length
                  ? {
                      create: variant.options.map(option => ({
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

  async findAll() {
    return this.prisma.product.findMany({
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

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { categoryId, price, stock, ...rest } = updateProductDto;
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

    const normalizedPrice =
      price === undefined || price === null ? undefined : Number(price);
    const normalizedStock =
      stock === undefined || stock === null ? undefined : Number(stock);

    const data = {
      ...rest,
      price: Number.isNaN(normalizedPrice) ? undefined : normalizedPrice,
      stock: Number.isNaN(normalizedStock) ? undefined : normalizedStock,
      categoryId: resolvedCategoryId,
    };

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
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
    } catch (error) {
      throw new NotFoundException('Product not found');
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
