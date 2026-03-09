import { Audience } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name_mm?: string;

  @IsString()
  @IsOptional()
  description_en?: string;

  @IsString()
  @IsOptional()
  description_mm?: string;

  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : parseFloat(value),
  )
  @IsNumber()
  @IsOptional()
  price?: number;

  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : parseInt(value, 10),
  )
  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(Audience)
  @IsOptional()
  audience?: Audience;
}
