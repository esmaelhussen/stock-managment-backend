import { Stock } from './stock.entity';
import { User } from './user.entity';
import { Warehouse } from './warehouse.entity';
import { Product } from './product.entity';
export declare enum TransactionType {
    ADD = "add",
    REMOVE = "remove",
    TRANSFER = "transfer"
}
export declare class StockTransaction {
    id: string;
    stock: Stock;
    sourceWarehouse: Warehouse;
    targetWarehouse: Warehouse;
    product: Product;
    quantity: number;
    price: number;
    type: TransactionType;
    timestamp: Date;
    transactedBy: User;
}
