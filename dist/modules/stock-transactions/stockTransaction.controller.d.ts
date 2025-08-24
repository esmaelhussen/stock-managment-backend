import { StockTransactionService } from './stockTransaction.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { User } from '../../entities/user.entity';
export declare class StockTransactionController {
    private readonly stockTransactionService;
    constructor(stockTransactionService: StockTransactionService);
    create(createStockTransactionDto: CreateStockTransactionDto, user: User): Promise<import("../../entities/stockTransaction.entity").StockTransaction>;
    getAllTransactions(user: User): Promise<import("../../entities/stockTransaction.entity").StockTransaction[]>;
    getAllStock(user: User): Promise<import("../../entities/stock.entity").Stock[]>;
}
