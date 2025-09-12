import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseFloat(value)) // Ensure the value is parsed as a number
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @IsNotEmpty()
  @IsUUID()
  brandId: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  alertQuantity?: number;
}
