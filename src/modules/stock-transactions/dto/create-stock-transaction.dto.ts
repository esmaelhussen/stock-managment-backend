import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { TransactionType } from '../../../entities/stockTransaction.entity';

export class CreateStockTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  // Source warehouse is required for REMOVE and TRANSFER transactions
  @ValidateIf(
    (o) =>
      o.type === TransactionType.REMOVE ||
      o.type === TransactionType.TRANSFER ||
      o.type === TransactionType.ADD,
  )
  @IsUUID()
  @IsNotEmpty()
  sourceWarehouseId: string;

  // Target warehouse is required only for TRANSFER transactions
  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsUUID()
  @IsNotEmpty()
  targetWarehouseId?: string;

  @IsUUID()
  @IsNotEmpty()
  transactedById: string;
}
