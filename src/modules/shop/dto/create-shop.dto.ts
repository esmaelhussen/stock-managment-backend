import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  address: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsString()
  description?: string;
}
