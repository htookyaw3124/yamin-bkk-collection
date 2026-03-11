import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput) {
    return this.prisma.order.update({
      where: { id },
      data,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
