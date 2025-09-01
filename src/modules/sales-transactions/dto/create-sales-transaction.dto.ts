import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  Min,
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
  @IsString()
  @IsNotEmpty()
  shopId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  creditorName?: string;

  @ValidateNested({ each: true })
  @Type(() => SalesTransactionItemDto)
  @ArrayMinSize(1)
  items: SalesTransactionItemDto[];
}
