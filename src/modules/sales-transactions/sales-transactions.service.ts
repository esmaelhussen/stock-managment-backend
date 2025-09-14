import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTransaction } from '../../entities/salesTransaction.entity';
import { SalesTransactionItem } from '../../entities/salesTransactionItem.entity';
import { Stock } from '../../entities/stock.entity';
import { Product } from '../../entities/product.entity';
import { Shop } from '../../entities/shop.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { User } from '../../entities/user.entity';
import { Customer } from '../../entities/customer.entity';
import {
  CreateSalesTransactionDto,
  SalesTransactionItemDto,
} from './dto/create-sales-transaction.dto';
import { Between } from 'typeorm';
import { CustomerType } from '../../entities/salesTransaction.entity'; // Correct import

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
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async findAll(
    shopId?: string,
    warehouseId?: string,
  ): Promise<SalesTransaction[]> {
    const where: any = {};

    if (shopId) {
      where.shop = { id: shopId };
    } else if (warehouseId) {
      where.warehouse = { id: warehouseId };
    }

    return this.transactionRepo.find({
      where,
      relations: [
        'items',
        'items.product',
        'shop',
        'warehouse',
        'transactedBy',
        'customer',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateSalesTransactionDto): Promise<SalesTransaction> {
    if (!dto.shopId && !dto.warehouseId) {
      throw new BadRequestException(
        'Either shopId or warehouseId must be provided',
      );
    }

    const transactedBy = await this.userRepository.findOne({
      where: { id: dto.transactedById },
    });
    if (!transactedBy) throw new BadRequestException('User not found');

    let location: Shop | Warehouse | null = null;
    if (dto.shopId) {
      location = await this.shopRepo.findOne({ where: { id: dto.shopId } });
      if (!location) throw new BadRequestException('Shop not found');
    } else if (dto.warehouseId) {
      location = await this.warehouseRepo.findOne({
        where: { id: dto.warehouseId },
      });
      if (!location) throw new BadRequestException('Warehouse not found');
    }

    let customer: Customer | undefined = undefined;
    if (dto.customerType === 'Regular') {
      if (!dto.customerId) {
        throw new BadRequestException(
          'Customer ID is required for Regular customers',
        );
      }
      customer =
        (await this.customerRepo.findOne({ where: { id: dto.customerId } })) ||
        undefined;
      if (!customer) {
        throw new BadRequestException('Customer not found');
      }
    }

    // const transaction = this.transactionRepo.create({
    //     ...dto,
    //     shop: dto.shopId ? (location as Shop) : undefined,
    //     warehouse: dto.warehouseId ? (location as Warehouse) : undefined,
    //     transactedBy,
    //     customer,
    //   });

    //   return this.transactionRepo.save(transaction);
    // }

    let totalPrice = 0;
    const items: SalesTransactionItem[] = [];

    for (const itemDto of dto.items) {
      const stock = await this.stockRepo.findOne({
        where: {
          [dto.shopId ? 'shop' : 'warehouse']: {
            id: dto.shopId || dto.warehouseId,
          },
          product: { id: itemDto.productId },
        },
        relations: ['shop', 'warehouse', 'product'],
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
      [dto.shopId ? 'shop' : 'warehouse']: location,
      paymentMethod: dto.paymentMethod,
      creditorName: dto.creditorName,
      totalPrice,
      items,
      transactedBy,
      customerType: dto.customerType === 'Regular' ? CustomerType.REGULAR : CustomerType.WALK_IN, // Map to enum
      customer, // Set customer relationship
    });
    const savedTransaction = await this.transactionRepo.save(transaction);

    // Decrease stock quantities and update total sold and price
    for (const itemDto of dto.items) {
      // Decrease quantity
      await this.stockRepo.decrement(
        {
          [dto.shopId ? 'shop' : 'warehouse']: {
            id: dto.shopId || dto.warehouseId,
          },
          product: { id: itemDto.productId },
        },
        'quantity',
        itemDto.quantity,
      );

      // Increment total sold for the product

      // Update the price based on total sold
      const product = await this.productRepo.findOne({
        where: { id: itemDto.productId },
      });
      const price = Number(product?.price) || 0;
      const itemTotal = price * itemDto.quantity;
      await this.stockRepo.increment(
        {
          [dto.shopId ? 'shop' : 'warehouse']: {
            id: dto.shopId || dto.warehouseId,
          },
          product: { id: itemDto.productId },
        },
        'price',
        itemTotal,
      );
    }

    return savedTransaction;
  }

  async updateStatus(
    id: string,
    status: 'unpayed' | 'payed',
  ): Promise<SalesTransaction> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });
    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.paymentMethod !== 'credit') {
      throw new BadRequestException(
        'Only credit transactions can update status',
      );
    }

    transaction.status = status;
    return this.transactionRepo.save(transaction);
  }

  async generateReport(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly',
    shopId?: string,
    warehouseId?: string,
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        throw new BadRequestException('Invalid period');
    }

    const where: any = {
      createdAt: Between(startDate, now),
    };

    if (shopId) {
      where.shop = { id: shopId };
    } else if (warehouseId) {
      where.warehouse = { id: warehouseId };
    }

    const transactions = await this.transactionRepo.find({
      where,
      relations: ['items', 'items.product', 'shop', 'warehouse'],
    });

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Per-day grouped results
    const grouped: Record<
      string,
      {
        productSales: Record<
          string,
          {
            name: string;
            quantity: number;
            eachPrice: number;
            total: number;
            source?: { type: 'shop' | 'warehouse'; name: string };
          }
        >;
        paymentStatus: { payed: number; unpayed: number };
        paymentMethods: Record<string, number>;
        totals: {
          totalQuantity: number;
          totalPrice: number;
          totalTransactions: number;
        };
        source?: { type: 'shop' | 'warehouse'; name: string }; // Added source property
        mostUsedPaymentMethod?: string | null;
      }
    > = {};

    // Overall summary
    const summary = {
      productSales: {} as Record<
        string,
        { name: string; quantity: number; eachPrice: number; total: number }
      >,
      paymentStatus: { payed: 0, unpayed: 0 },
      paymentMethods: {} as Record<string, number>,
      totals: { totalQuantity: 0, totalPrice: 0, totalTransactions: 0 },
      mostUsedPaymentMethod: null as string | null,
    };

    transactions.forEach((tx) => {
      const dateKey = formatDate(new Date(tx.createdAt));

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          productSales: {},
          paymentStatus: { payed: 0, unpayed: 0 },
          paymentMethods: {},
          totals: { totalQuantity: 0, totalPrice: 0, totalTransactions: 0 },
        };
      }

      const dayData = grouped[dateKey];

      // Add shop or warehouse name to the grouped data
      if (!dayData.source) {
        dayData.source = tx.shop
          ? { type: 'shop', name: tx.shop.name }
          : { type: 'warehouse', name: tx.warehouse.name };
      }

      // --- Product sales ---
      tx.items.forEach((item) => {
        // Day-level
        if (!dayData.productSales[item.product.id]) {
          dayData.productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            eachPrice: Number(Number(item.price).toFixed(2)),
            total: 0,
            source: tx.shop
              ? { type: 'shop', name: tx.shop.name }
              : { type: 'warehouse', name: tx.warehouse.name }, // Populate source
          };
        }
        dayData.productSales[item.product.id].quantity += item.quantity;
        dayData.productSales[item.product.id].total = Number(
          (
            Number(dayData.productSales[item.product.id].total) +
            item.quantity * item.price
          ).toFixed(2),
        );

        dayData.totals.totalQuantity += item.quantity;
        dayData.totals.totalPrice += Number(Number(item.totalPrice).toFixed(2));

        // Summary-level
        if (!summary.productSales[item.product.id]) {
          summary.productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            eachPrice: Number(Number(item.price).toFixed(2)),
            total: 0,
          };
        }
        summary.productSales[item.product.id].quantity += item.quantity;
        summary.productSales[item.product.id].total += Number(
          Number(item.totalPrice).toFixed(2),
        );

        summary.totals.totalQuantity += item.quantity;
        summary.totals.totalPrice += Number(Number(item.totalPrice).toFixed(2));
      });

      // --- Payment status ---
      dayData.paymentStatus[tx.status] =
        (dayData.paymentStatus[tx.status] || 0) + 1;
      summary.paymentStatus[tx.status] =
        (summary.paymentStatus[tx.status] || 0) + 1;

      // --- Payment methods ---
      if (tx.paymentMethod) {
        dayData.paymentMethods[tx.paymentMethod] =
          (dayData.paymentMethods[tx.paymentMethod] || 0) + 1;
        summary.paymentMethods[tx.paymentMethod] =
          (summary.paymentMethods[tx.paymentMethod] || 0) + 1;
      }

      // --- Transaction count ---
      dayData.totals.totalTransactions += 1;
      summary.totals.totalTransactions += 1;
    });

    // Most used method per day
    for (const dateKey of Object.keys(grouped)) {
      const methods = grouped[dateKey].paymentMethods;
      let mostUsed: string | null = null;
      let max = 0; // Declare max variable
      for (const [method, count] of Object.entries(methods)) {
        if (count > max) {
          mostUsed = method;
          max = count;
        }
      }
      grouped[dateKey].mostUsedPaymentMethod = mostUsed;
    }

    // Most used method in summary
    let summaryMostUsed: string | null = null;
    let max = 0;
    for (const [method, count] of Object.entries(summary.paymentMethods)) {
      if (count > max) {
        summaryMostUsed = method;
        max = count;
      }
    }
    summary.mostUsedPaymentMethod = summaryMostUsed;

    return {
      range: { period, startDate, endDate: now },
      grouped,
      summary,
    };
  }
}
