import { Audience } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

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

  @Transform(({ value }) => (value === '' ? undefined : value))
  @ValidateIf(
    (_obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUrl()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  variants?: any;

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
