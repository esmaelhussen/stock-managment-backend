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
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, CreditFrequency } from '../../../entities/salesTransaction.entity';

export class SalesTransactionItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsEnum(['fixed', 'percent', 'none'])
  discountType?: 'fixed' | 'percent' | 'none';
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

  @IsNotEmpty()
  @IsEnum(['Walk-In', 'Regular'])
  customerType: 'Walk-In' | 'Regular';

  @ValidateIf((o) => o.customerType === 'Regular')
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @IsOptional()
  @IsEnum(['fixed', 'percent', 'none'])
  discountType?: 'fixed' | 'percent' | 'none';

  // Credit payment fields
  @ValidateIf((o) => o.paymentMethod === 'credit')
  @IsInt()
  @Min(1)
  creditDuration?: number;

  @ValidateIf((o) => o.paymentMethod === 'credit')
  @IsEnum(CreditFrequency)
  creditFrequency?: CreditFrequency;

  @IsOptional()
  @IsDateString()
  creditStartDate?: string;
}
