import { Repository } from 'typeorm';
import { StockTransaction, TransactionType } from '../../entities/stockTransaction.entity';
import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';
export declare class StockTransactionService {
    private readonly stockTransactionRepository;
    private readonly stockRepository;
    private readonly warehouseRepository;
    private readonly productRepository;
    constructor(stockTransactionRepository: Repository<StockTransaction>, stockRepository: Repository<Stock>, warehouseRepository: Repository<Warehouse>, productRepository: Repository<Product>);
    handleTransaction(productId: string, quantity: number, type: TransactionType, sourceWarehouseId: string, targetWarehouseId?: string): Promise<StockTransaction>;
    getAllTransactions(): Promise<StockTransaction[]>;
    getAllStock(): Promise<Stock[]>;
}
