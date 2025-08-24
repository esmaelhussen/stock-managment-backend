import { StockTransactionService } from './stockTransaction.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
export declare class StockTransactionController {
    private readonly stockTransactionService;
    constructor(stockTransactionService: StockTransactionService);
    create(createStockTransactionDto: CreateStockTransactionDto): Promise<import("../../entities/stockTransaction.entity").StockTransaction>;
    getAllTransactions(): Promise<import("../../entities/stockTransaction.entity").StockTransaction[]>;
    getAllStock(): Promise<import("../../entities/stock.entity").Stock[]>;
}
