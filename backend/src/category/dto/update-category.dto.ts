import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  name_mm?: string;

  @IsString()
  @IsOptional()
  slug?: string;
}
