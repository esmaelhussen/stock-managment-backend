import { Product } from './product.entity';
import { Warehouse } from './warehouse.entity';
export declare class Stock {
    id: string;
    product: Product;
    warehouse: Warehouse;
    quantity: number;
    price: number;
    timestamp: Date;
}
