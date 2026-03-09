import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name_en: 'asc' },
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: body.slug },
    });
    if (existing) {
      throw new BadRequestException('Slug already exists');
    }

    return this.prisma.category.create({
      data: body,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await this.prisma.category.findUnique({
        where: { slug: body.slug },
      });
      if (slugTaken) {
        throw new BadRequestException('Slug already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: body,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (productCount > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
