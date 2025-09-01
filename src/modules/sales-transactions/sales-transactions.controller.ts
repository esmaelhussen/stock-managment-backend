import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SalesTransactionsService } from './sales-transactions.service';
import { CreateSalesTransactionDto } from './dto/create-sales-transaction.dto';
import { SalesTransaction } from '../../entities/salesTransaction.entity';

@Controller('sales-transactions')
export class SalesTransactionsController {
  constructor(private readonly salesTransactionsService: SalesTransactionsService) {}

  @Post()
  async create(@Body() dto: CreateSalesTransactionDto): Promise<SalesTransaction> {
    return this.salesTransactionsService.create(dto);
  }

  @Get()
  async findAll(@Query('shopId') shopId?: string): Promise<SalesTransaction[]> {
    return this.salesTransactionsService.findAll(shopId);
  }
}
