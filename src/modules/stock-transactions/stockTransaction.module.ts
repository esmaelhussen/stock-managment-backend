import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransaction } from '../../entities/stockTransaction.entity';
import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Shop } from 'src/entities/shop.entity';
import { StockTransactionService } from './stockTransaction.service';
import { StockTransactionController } from './stockTransaction.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockTransaction,
      Stock,
      Warehouse,
      Product,
      User,
      Shop,
    ]),
  ],
  providers: [StockTransactionService],
  controllers: [StockTransactionController],
})
export class StockTransactionModule {}
