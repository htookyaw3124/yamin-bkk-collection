import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Audience } from '@prisma/client';
import { Transform, Type } from 'class-transformer';

export class VariantOptionDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  value_en: string;

  @IsString()
  @IsNotEmpty()
  value_mm: string;
}

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name_en: string;

  @IsString()
  @IsNotEmpty()
  name_mm: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === '' ? undefined : parseFloat(value),
  )
  @IsNumber({}, { message: 'priceOverride must be a number' })
  priceOverride?: number;

  @Transform(({ value }) => parseInt(value ?? '0', 10))
  @IsNumber()
  stock: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantOptionDto)
  @IsOptional()
  options?: VariantOptionDto[];
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name_en: string;

  @IsString()
  @IsNotEmpty()
  name_mm: string;

  @IsString()
  @IsOptional()
  description_en?: string;

  @IsString()
  @IsOptional()
  description_mm?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @Transform(({ value }) => parseInt(value ?? '0', 10))
  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsEnum(Audience)
  @IsOptional()
  audience?: Audience;

  @IsUUID()
  @IsOptional()
  brandId?: string;

  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf(
    (_obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value || [];
  })
  @IsArray()
  @IsOptional()
  variants?: CreateVariantDto[];

  @IsString()
  @IsOptional()
  variantImageMap?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim().length) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return [];
      }
    }
    return value;
  })
  variantGroups?: any;
}
