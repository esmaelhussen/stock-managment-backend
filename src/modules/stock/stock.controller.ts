import { Controller, Get, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock')
@UseGuards(JwtAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.stockService.findAll(user.warehouseId);
  }
}
