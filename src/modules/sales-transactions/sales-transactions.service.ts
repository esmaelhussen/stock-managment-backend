// ...existing code...
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTransaction } from '../../entities/salesTransaction.entity';
import { SalesTransactionItem } from '../../entities/salesTransactionItem.entity';
import { Stock } from '../../entities/stock.entity';
import { Product } from '../../entities/product.entity';
import { Shop } from '../../entities/shop.entity';
import {
  CreateSalesTransactionDto,
  SalesTransactionItemDto,
} from './dto/create-sales-transaction.dto';

@Injectable()
export class SalesTransactionsService {
  constructor(
    @InjectRepository(SalesTransaction)
    private readonly transactionRepo: Repository<SalesTransaction>,
    @InjectRepository(SalesTransactionItem)
    private readonly itemRepo: Repository<SalesTransactionItem>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopRepo: Repository<Shop>,
  ) {}

  async findAll(shopId?: string): Promise<SalesTransaction[]> {
    const where = shopId ? { shop: { id: shopId } } : {};
    return this.transactionRepo.find({
      where,
      relations: ['items', 'items.product', 'shop'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateSalesTransactionDto): Promise<SalesTransaction> {
    const shop = await this.shopRepo.findOne({ where: { id: dto.shopId } });
    if (!shop) throw new BadRequestException('Shop not found');

    let totalPrice = 0;
    const items: SalesTransactionItem[] = [];

    for (const itemDto of dto.items) {
      const stock = await this.stockRepo.findOne({
        where: {
          shop: { id: dto.shopId },
          product: { id: itemDto.productId },
        },
        relations: ['shop', 'product'],
      });
      if (!stock) {
        throw new BadRequestException(`Stock or product not found`);
      }
      if (stock.quantity < itemDto.quantity) {
        const productName = stock.product?.name || itemDto.productId;
        throw new BadRequestException(
          `Insufficient stock for product ${productName}`,
        );
      }
      const product = await this.productRepo.findOne({
        where: { id: itemDto.productId },
      });
      if (!product) throw new BadRequestException('Product not found');
      const price = Number(product.price);
      const itemTotal = price * itemDto.quantity;
      totalPrice += itemTotal;
      const transactionItem = this.itemRepo.create({
        product,
        quantity: itemDto.quantity,
        price,
        totalPrice: itemTotal,
      });
      items.push(transactionItem);
    }

    // Example credit limit check (customize as needed)
    if (dto.paymentMethod === 'credit') {
      const CREDIT_LIMIT = 1000; // Example limit
      if (totalPrice > CREDIT_LIMIT) {
        throw new BadRequestException('Credit limit exceeded');
      }
      if (!dto.creditorName) {
        throw new BadRequestException(
          'Creditor name required for credit payment',
        );
      }
    } else {
      dto.creditorName = undefined;
    }

    const transaction = this.transactionRepo.create({
      shop,
      paymentMethod: dto.paymentMethod,
      creditorName: dto.creditorName,
      totalPrice,
      items,
    });
    const savedTransaction = await this.transactionRepo.save(transaction);

    // Decrease stock quantities
    for (const itemDto of dto.items) {
      // Decrease quantity
      await this.stockRepo.decrement(
        {
          shop: { id: dto.shopId },
          product: { id: itemDto.productId },
        },
        'quantity',
        itemDto.quantity,
      );
      // Increase price by total sold for this product
      const product = await this.productRepo.findOne({
        where: { id: itemDto.productId },
      });
      const price = Number(product?.price) || 0;
      const itemTotal = price * itemDto.quantity;
      await this.stockRepo.increment(
        {
          shop: { id: dto.shopId },
          product: { id: itemDto.productId },
        },
        'price',
        itemTotal,
      );
    }

    return savedTransaction;
  }
}
