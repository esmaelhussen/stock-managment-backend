import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  ValidateIf,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { TransactionType } from '../../../entities/stockTransaction.entity';

/**
 * Custom validator to ensure only one of two fields is defined (mutually exclusive).
 */
@ValidatorConstraint({ name: 'onlyOneDefined', async: false })
class OnlyOneDefinedConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return !(value && relatedValue); // true only if not both are defined
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `Only one of ${args.property} or ${relatedPropertyName} should be provided`;
  }
}

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

  // Source (shop or warehouse)
  @ValidateIf(
    (o) =>
      o.type === TransactionType.ADD ||
      o.type === TransactionType.REMOVE ||
      o.type === TransactionType.TRANSFER,
  )
  @IsUUID()
  @Validate(OnlyOneDefinedConstraint, ['sourceShopId'])
  sourceWarehouseId?: string;

  @ValidateIf(
    (o) =>
      o.type === TransactionType.ADD ||
      o.type === TransactionType.REMOVE ||
      o.type === TransactionType.TRANSFER,
  )
  @IsUUID()
  @Validate(OnlyOneDefinedConstraint, ['sourceWarehouseId'])
  sourceShopId?: string;

  // Target (only for transfer)
  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsUUID()
  @Validate(OnlyOneDefinedConstraint, ['targetShopId'])
  targetWarehouseId?: string;

  @ValidateIf((o) => o.type === TransactionType.TRANSFER)
  @IsUUID()
  @Validate(OnlyOneDefinedConstraint, ['targetWarehouseId'])
  targetShopId?: string;

  @IsUUID()
  @IsNotEmpty()
  transactedById: string;
}
