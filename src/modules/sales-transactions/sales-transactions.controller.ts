import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SalesTransactionsService } from './sales-transactions.service';
import { CreateSalesTransactionDto } from './dto/create-sales-transaction.dto';
import { SalesTransaction } from '../../entities/salesTransaction.entity';
import type { Request } from 'express';

@Controller('sales-transactions')
export class SalesTransactionsController {
  constructor(
    private readonly salesTransactionsService: SalesTransactionsService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateSalesTransactionDto,
    // @Req() req: Request,
  ): Promise<SalesTransaction> {
    // const userId = req.cookies['userId']; // Extract userId from cookies
    // if (!userId) {
    //   throw new BadRequestException('User ID is required');
    // }
    // dto.transactedById = transa; // Assign userId to the DTO
    return this.salesTransactionsService.create(dto);
  }

  @Get()
  async findAll(
    @Query('shopId') shopId?: string,
    @Query('warehouseId') warehouseId?: string,
  ): Promise<SalesTransaction[]> {
    return this.salesTransactionsService.findAll(shopId, warehouseId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'unpayed' | 'payed',
  ): Promise<SalesTransaction> {
    return this.salesTransactionsService.updateStatus(id, status);
  }

  @Get('report')
  async getReport(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    @Query('shopId') shopId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.salesTransactionsService.generateReport(
      period,
      shopId,
      warehouseId,
    );
  }
}
