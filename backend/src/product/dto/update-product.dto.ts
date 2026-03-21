import { Audience } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
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

  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === ''
      ? undefined
      : parseFloat(value as string),
  )
  @IsNumber()
  @IsOptional()
  price?: number;

  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === ''
      ? undefined
      : parseInt(value as string, 10),
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

  @IsUUID()
  @IsOptional()
  brandId?: string;

  @Transform(
    ({ value }: { value: unknown }) =>
      (value === '' ? undefined : value) as string | undefined,
  )
  @ValidateIf(
    (_obj, value) => value !== undefined && value !== null && value !== '',
  )
  @IsUrl()
  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsOptional()
  variants?: unknown[];

  @IsString()
  @IsOptional()
  variantImageMap?: string;

  @IsString()
  @IsOptional()
  optionImageMap?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string' && value.trim().length) {
      try {
        return JSON.parse(value) as unknown[];
      } catch {
        return [] as unknown[];
      }
    }
    return (value || []) as unknown[];
  })
  variantGroups?: unknown[];
}
