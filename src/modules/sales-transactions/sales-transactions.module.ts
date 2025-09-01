import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTransactionsService } from './sales-transactions.service';
import { SalesTransactionsController } from './sales-transactions.controller';
import { SalesTransaction } from '../../entities/salesTransaction.entity';
import { SalesTransactionItem } from '../../entities/salesTransactionItem.entity';
import { Stock } from '../../entities/stock.entity';
import { Product } from '../../entities/product.entity';
import { Shop } from '../../entities/shop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesTransaction,
      SalesTransactionItem,
      Stock,
      Product,
      Shop,
    ]),
  ],
  controllers: [SalesTransactionsController],
  providers: [SalesTransactionsService],
  exports: [SalesTransactionsService],
})
export class SalesTransactionsModule {}
