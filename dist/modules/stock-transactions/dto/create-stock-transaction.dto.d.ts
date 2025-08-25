import { TransactionType } from '../../../entities/stockTransaction.entity';
export declare class CreateStockTransactionDto {
    productId: string;
    quantity: number;
    type: TransactionType;
    sourceWarehouseId: string;
    targetWarehouseId?: string;
    transactedById: string;
}
