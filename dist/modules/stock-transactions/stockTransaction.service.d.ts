import { Repository } from 'typeorm';
import { StockTransaction, TransactionType } from '../../entities/stockTransaction.entity';
import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';
import { User } from 'src/entities/user.entity';
export declare class StockTransactionService {
    private readonly stockTransactionRepository;
    private readonly stockRepository;
    private readonly userRepository;
    private readonly warehouseRepository;
    private readonly productRepository;
    constructor(stockTransactionRepository: Repository<StockTransaction>, stockRepository: Repository<Stock>, userRepository: Repository<User>, warehouseRepository: Repository<Warehouse>, productRepository: Repository<Product>);
    handleTransaction(productId: string, quantity: number, type: TransactionType, sourceWarehouseId: string, targetWarehouseId?: string, transactedById?: string): Promise<StockTransaction>;
    getAllTransactions(warehouseId: string): Promise<StockTransaction[]>;
    getAllStock(warehouseId: string): Promise<Stock[]>;
}
