import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Prisma } from '@prisma/client';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Post()
  create(@Body() data: Prisma.CustomerCreateInput) {
    return this.customerService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.CustomerUpdateInput) {
    return this.customerService.update(id, data);
  }
}
