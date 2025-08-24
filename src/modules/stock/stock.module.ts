import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from '../../entities/stock.entity';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), AuthModule],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
