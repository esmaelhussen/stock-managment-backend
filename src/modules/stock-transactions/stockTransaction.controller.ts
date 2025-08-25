import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { StockTransactionService } from './stockTransaction.service';
import { CreateStockTransactionDto } from './dto/create-stock-transaction.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock-transactions')
@UseGuards(JwtAuthGuard)
export class StockTransactionController {
  constructor(
    private readonly stockTransactionService: StockTransactionService,
  ) {}

  @Post()
  create(
    @Body() createStockTransactionDto: CreateStockTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.stockTransactionService.handleTransaction(
      createStockTransactionDto.productId,
      createStockTransactionDto.quantity,
      createStockTransactionDto.type, // Correctly cast type
      user.warehouseId, // Use user's warehouseId as source
      createStockTransactionDto.targetWarehouseId,
      createStockTransactionDto.transactedById,
    );
  }

  @Get('history')
  async getAllTransactions(@CurrentUser() user: User) {
    return this.stockTransactionService.getAllTransactions(user.warehouseId);
  }

  @Get('all-stock')
  async getAllStock(@CurrentUser() user: User) {
    return this.stockTransactionService.getAllStock(user.warehouseId);
  }
}
