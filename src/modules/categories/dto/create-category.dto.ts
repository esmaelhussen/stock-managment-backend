import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsUUID()
  parentCategoryId?: string;
}
