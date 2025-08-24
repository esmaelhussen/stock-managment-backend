import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { StockTransactionService } from './stockTransaction.service';
import { TransactionType } from '../../entities/stockTransaction.entity';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';

@Controller('stock-transactions')
export class StockTransactionController {
  constructor(
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  @Post()
  create(@Body() createStockTransactionDto: CreateStockTransactionDto) {
    return this.stockTransactionService.handleTransaction(
      createStockTransactionDto.productId,
      createStockTransactionDto.quantity,
      createStockTransactionDto.type as TransactionType, // Correctly cast type
      createStockTransactionDto.sourceWarehouseId,
      createStockTransactionDto.targetWarehouseId,
    );
  }

  //   @Get('stock')
  //   async getStock(@Query('warehouseId') warehouseId: string) {
  //     return this.stockTransactionService.getStockByWarehouse(warehouseId);
  //   }

  @Get('history')
  async getAllTransactions() {
    return this.stockTransactionService.getAllTransactions();
  }

  @Get('all-stock')
  async getAllStock() {
    return this.stockTransactionService.getAllStock();
  }
}
