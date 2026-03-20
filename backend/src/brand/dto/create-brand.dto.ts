import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  logo_url?: string;
}
