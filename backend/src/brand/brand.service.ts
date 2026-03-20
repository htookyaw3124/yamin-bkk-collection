import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    try {
      return await this.prisma.brand.create({
        data: createBrandDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Brand name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    try {
      return await this.prisma.brand.update({
        where: { id },
        data: updateBrandDto,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Brand name already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.brand.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }
      throw error;
    }
  }
}
