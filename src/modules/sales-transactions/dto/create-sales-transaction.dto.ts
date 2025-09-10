import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  Min,
  ValidateIf,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../entities/salesTransaction.entity';

export class SalesTransactionItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateSalesTransactionDto {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.warehouseId)
  shopId?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.shopId)
  warehouseId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  creditorName?: string;

  @IsUUID()
  transactedById?: string;

  @ValidateNested({ each: true })
  @Type(() => SalesTransactionItemDto)
  @ArrayMinSize(1)
  items: SalesTransactionItemDto[];
}
