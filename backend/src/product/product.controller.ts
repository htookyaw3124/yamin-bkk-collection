import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Controller Create DTO:', createProductDto.variants);
    return this.productService.create(createProductDto, files);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('brandId') brandId?: string,
  ) {
    return this.productService.findAll(search, brandId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 50))
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    console.log('Controller Update ID:', id);
    console.log('Controller Update DTO:', updateProductDto);
    console.log('Controller Update Files Count:', files?.length);
    return this.productService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
