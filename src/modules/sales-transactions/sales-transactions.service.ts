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
import {
  CustomerType,
  CreditFrequency,
} from '../../entities/salesTransaction.entity'; // Correct import

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
    let totalDiscountAmount = 0;
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

      // Calculate item discount
      let itemDiscountAmount = 0;
      let itemFinalPrice = itemTotal;

      if (itemDto.discountType === 'percent' && itemDto.discountPercent) {
        itemDiscountAmount = (itemTotal * itemDto.discountPercent) / 100;
        itemFinalPrice = itemTotal - itemDiscountAmount;
      } else if (itemDto.discountType === 'fixed' && itemDto.discountAmount) {
        itemDiscountAmount = Math.min(itemDto.discountAmount, itemTotal);
        itemFinalPrice = itemTotal - itemDiscountAmount;
      }

      totalPrice += itemTotal;
      totalDiscountAmount += itemDiscountAmount;

      const transactionItem = this.itemRepo.create({
        product,
        quantity: itemDto.quantity,
        price,
        totalPrice: itemTotal,
        discountType: itemDto.discountType || 'none',
        discountAmount: itemDiscountAmount,
        discountPercent: itemDto.discountPercent || 0,
        finalPrice: itemFinalPrice,
      });
      items.push(transactionItem);
    }

    // Handle credit payment
    let creditInstallmentAmount: number | undefined = undefined;
    let creditNextDueDate: Date | undefined = undefined;

    if (dto.paymentMethod === 'credit') {
      if (!dto.creditorName) {
        throw new BadRequestException(
          'Creditor name required for credit payment',
        );
      }
      if (!dto.creditDuration || !dto.creditFrequency) {
        throw new BadRequestException(
          'Credit duration and frequency required for credit payment',
        );
      }

      // Calculate installment amount
      creditInstallmentAmount =
        (totalPrice - totalDiscountAmount) / dto.creditDuration;

      // Calculate next due date
      const startDate = dto.creditStartDate
        ? new Date(dto.creditStartDate)
        : new Date();
      creditNextDueDate = new Date(startDate);

      switch (dto.creditFrequency) {
        case CreditFrequency.WEEKLY:
          creditNextDueDate.setDate(creditNextDueDate.getDate() + 7);
          break;
        case CreditFrequency.MONTHLY:
          creditNextDueDate.setMonth(creditNextDueDate.getMonth() + 1);
          break;
        case CreditFrequency.YEARLY:
          creditNextDueDate.setFullYear(creditNextDueDate.getFullYear() + 1);
          break;
      }
    } else {
      dto.creditorName = undefined;
    }

    // Calculate transaction-level discount
    let transactionDiscountAmount = 0;
    let finalTransactionPrice = totalPrice - totalDiscountAmount;

    if (dto.discountType === 'percent' && dto.discountPercent) {
      transactionDiscountAmount =
        (finalTransactionPrice * dto.discountPercent) / 100;
      finalTransactionPrice = finalTransactionPrice - transactionDiscountAmount;
    } else if (dto.discountType === 'fixed' && dto.discountAmount) {
      transactionDiscountAmount = Math.min(
        dto.discountAmount,
        finalTransactionPrice,
      );
      finalTransactionPrice = finalTransactionPrice - transactionDiscountAmount;
    }

    const transactionData: any = {
      paymentMethod: dto.paymentMethod,
      creditorName: dto.creditorName,
      totalPrice,
      discountType: dto.discountType || 'none',
      discountAmount: transactionDiscountAmount,
      discountPercent: dto.discountPercent || 0,
      finalPrice: finalTransactionPrice,
      items,
      transactedBy,
      customerType:
        dto.customerType === 'Regular'
          ? CustomerType.REGULAR
          : CustomerType.WALK_IN, // Map to enum
      customer, // Set customer relationship
      // Credit fields
      creditDuration:
        dto.paymentMethod === 'credit' ? dto.creditDuration : undefined,
      creditFrequency:
        dto.paymentMethod === 'credit' ? dto.creditFrequency : undefined,
      creditPaidAmount: dto.paymentMethod === 'credit' ? 0 : undefined,
      creditInstallmentAmount:
        dto.paymentMethod === 'credit' ? creditInstallmentAmount : undefined,
      creditStartDate:
        dto.paymentMethod === 'credit' && dto.creditStartDate
          ? new Date(dto.creditStartDate)
          : dto.paymentMethod === 'credit'
            ? new Date()
            : undefined,
      creditNextDueDate:
        dto.paymentMethod === 'credit' ? creditNextDueDate : undefined,
      creditPaymentHistory: dto.paymentMethod === 'credit' ? [] : undefined,
      creditMissedPayments: dto.paymentMethod === 'credit' ? 0 : undefined,
      creditOverdue: dto.paymentMethod === 'credit' ? false : undefined,
      status: dto.paymentMethod === 'credit' ? 'unpayed' : 'payed',
    };

    // Set location based on shop or warehouse
    if (dto.shopId) {
      transactionData.shop = location;
    } else {
      transactionData.warehouse = location;
    }

    const transaction = this.transactionRepo.create(transactionData);
    const savedResult = await this.transactionRepo.save(transaction);
    const savedTransaction = Array.isArray(savedResult)
      ? savedResult[0]
      : savedResult;

    // Decrease stock quantities and update total sold and price
    for (let i = 0; i < dto.items.length; i++) {
      const itemDto = dto.items[i];

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
    }

    // --- fetch all stock items with product relation ---
    const stockItems = await Promise.all(
      dto.items.map((itemDto) =>
        this.stockRepo.findOne({
          where: {
            [dto.shopId ? 'shop' : 'warehouse']: {
              id: dto.shopId || dto.warehouseId,
            },
            product: { id: itemDto.productId },
          },
          relations: ['product'],
        }),
      ),
    );

    // --- calculate per-item totals after item discounts ---
    let totalPriceBeforeDiscount = 0;
    const itemBaseTotals: number[] = [];

    for (let i = 0; i < dto.items.length; i++) {
      const itemDto = dto.items[i];
      const stock = stockItems[i];
      if (!stock) continue;

      const productPrice = Number(stock.product.price);
      let itemBaseTotal = productPrice * itemDto.quantity;

      // apply per-item discount first
      if (itemDto.discountType === 'percent' && itemDto.discountPercent) {
        const discountAmount = (itemBaseTotal * itemDto.discountPercent) / 100;
        itemBaseTotal -= discountAmount;
      } else if (itemDto.discountType === 'fixed' && itemDto.discountAmount) {
        const discountAmount = Math.min(itemDto.discountAmount, itemBaseTotal);
        itemBaseTotal -= discountAmount;
      }

      itemBaseTotals[i] = itemBaseTotal;
      totalPriceBeforeDiscount += itemBaseTotal;
    }

    // --- update each stock (apply transaction discount proportionally if any) ---
    // ONLY update stock price if payment is NOT credit (credit payments update price when paid)
    if (dto.paymentMethod !== 'credit') {
      for (let i = 0; i < dto.items.length; i++) {
        const itemDto = dto.items[i];
        const stock = stockItems[i];
        if (!stock) continue;

        let itemFinalPriceForStock = itemBaseTotals[i];

        // apply proportional transaction discount (if any)
        if (transactionDiscountAmount > 0 && totalPriceBeforeDiscount > 0) {
          const proportionalDiscount =
            (itemFinalPriceForStock / totalPriceBeforeDiscount) *
            transactionDiscountAmount;
          itemFinalPriceForStock -= proportionalDiscount;
        }

        // update stock price
        stock.price = Number(
          (Number(stock.price) + itemFinalPriceForStock).toFixed(2),
        );

        // decrease stock quantity
        // stock.quantity = stock.quantity - itemDto.quantity;

        await this.stockRepo.save(stock);
      }
    }

    // Increment total sold for the product
    // Note: Using transaction's total finalPrice instead of individual item prices

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
            discount: number;
            source?: { type: 'shop' | 'warehouse'; name: string };
          }
        >;
        paymentStatus: { payed: number; unpayed: number };
        paymentMethods: Record<string, number>;
        totals: {
          totalQuantity: number;
          totalPrice: number;
          totalDiscount: number;
          totalTransactions: number;
        };
        source?: { type: 'shop' | 'warehouse'; name: string };
        mostUsedPaymentMethod?: string | null;
      }
    > = {};

    // Overall summary
    const summary = {
      productSales: {} as Record<
        string,
        { name: string; quantity: number; eachPrice: number; total: number; discount: number }
      >,
      paymentStatus: { payed: 0, unpayed: 0 },
      paymentMethods: {} as Record<string, number>,
      totals: { totalQuantity: 0, totalPrice: 0, totalDiscount: 0, totalTransactions: 0 },
      mostUsedPaymentMethod: null as string | null,
    };

    transactions.forEach((tx) => {
      const dateKey = formatDate(new Date(tx.createdAt));

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          productSales: {},
          paymentStatus: { payed: 0, unpayed: 0 },
          paymentMethods: {},
          totals: { totalQuantity: 0, totalPrice: 0, totalDiscount: 0, totalTransactions: 0 },
        };
      }

      const dayData = grouped[dateKey];

      // Add shop or warehouse name to the grouped data
      if (!dayData.source) {
        dayData.source = tx.shop
          ? { type: 'shop', name: tx.shop.name }
          : { type: 'warehouse', name: tx.warehouse.name };
      }

      // Calculate transaction-level discount proportion for each item
      const transactionDiscountAmount = Number(tx.discountAmount) || 0;
      const itemsSubtotal = tx.items.reduce((sum, item) => sum + Number(item.finalPrice || item.totalPrice), 0);

      // --- Product sales ---
      tx.items.forEach((item) => {
        // Calculate item's effective price after item-level discount
        const itemPrice = Number(item.price);
        const itemDiscountAmount = Number(item.discountAmount) || 0;
        const effectiveItemPrice = itemPrice - (itemDiscountAmount / item.quantity);

        // Calculate proportional transaction-level discount for this item
        let proportionalTransactionDiscount = 0;
        if (transactionDiscountAmount > 0 && itemsSubtotal > 0) {
          const itemProportion = Number(item.finalPrice || item.totalPrice) / itemsSubtotal;
          proportionalTransactionDiscount = transactionDiscountAmount * itemProportion;
        }

        // Total discount for the item (item-level + proportional transaction-level)
        const totalItemDiscount = itemDiscountAmount + proportionalTransactionDiscount;

        // Final price per unit after all discounts
        const finalPricePerUnit = effectiveItemPrice - (proportionalTransactionDiscount / item.quantity);

        // Day-level
        if (!dayData.productSales[item.product.id]) {
          dayData.productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            eachPrice: Number(finalPricePerUnit.toFixed(2)),
            total: 0,
            discount: 0,
            source: tx.shop
              ? { type: 'shop', name: tx.shop.name }
              : { type: 'warehouse', name: tx.warehouse.name },
          };
        }

        const itemFinalTotal = Number(item.finalPrice || item.totalPrice) - proportionalTransactionDiscount;

        dayData.productSales[item.product.id].quantity += item.quantity;
        dayData.productSales[item.product.id].total = Number(
          (Number(dayData.productSales[item.product.id].total) + itemFinalTotal).toFixed(2)
        );
        dayData.productSales[item.product.id].discount = Number(
          (Number(dayData.productSales[item.product.id].discount) + totalItemDiscount).toFixed(2)
        );

        dayData.totals.totalQuantity += item.quantity;
        dayData.totals.totalPrice = Number(
          (Number(dayData.totals.totalPrice) + itemFinalTotal).toFixed(2)
        );
        dayData.totals.totalDiscount = Number(
          (Number(dayData.totals.totalDiscount) + totalItemDiscount).toFixed(2)
        );

        // Summary-level
        if (!summary.productSales[item.product.id]) {
          summary.productSales[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            eachPrice: Number(finalPricePerUnit.toFixed(2)),
            total: 0,
            discount: 0,
          };
        }

        summary.productSales[item.product.id].quantity += item.quantity;
        summary.productSales[item.product.id].total = Number(
          (Number(summary.productSales[item.product.id].total) + itemFinalTotal).toFixed(2)
        );
        summary.productSales[item.product.id].discount = Number(
          (Number(summary.productSales[item.product.id].discount) + totalItemDiscount).toFixed(2)
        );

        summary.totals.totalQuantity += item.quantity;
        summary.totals.totalPrice = Number(
          (Number(summary.totals.totalPrice) + itemFinalTotal).toFixed(2)
        );
        summary.totals.totalDiscount = Number(
          (Number(summary.totals.totalDiscount) + totalItemDiscount).toFixed(2)
        );
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
      let max = 0;
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

  async makeCreditPayment(
    transactionId: string,
    amount: number,
  ): Promise<{ paidAmount: number; remainingAmount: number; status: string }> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
      relations: ['items', 'items.product', 'shop', 'warehouse'],
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    if (transaction.paymentMethod !== 'credit') {
      throw new BadRequestException('Transaction is not a credit payment');
    }

    if (transaction.status === 'payed') {
      throw new BadRequestException('Transaction is already fully paid');
    }

    // Ensure creditPaidAmount is initialized
    if (
      transaction.creditPaidAmount === null ||
      transaction.creditPaidAmount === undefined
    ) {
      transaction.creditPaidAmount = 0;
    }

    const totalAmount = Number(
      transaction.finalPrice || transaction.totalPrice,
    );
    const alreadyPaid = Number(transaction.creditPaidAmount) || 0;
    const remainingAmount = totalAmount - alreadyPaid;
    const paymentAmount = Math.min(Number(amount), remainingAmount);

    console.log('Credit Payment Debug:', {
      transactionId,
      totalAmount,
      alreadyPaid,
      remainingAmount,
      requestedAmount: amount,
      actualPaymentAmount: paymentAmount,
    });

    // Calculate proportional payment for stock price update
    const paymentRatio = paymentAmount / totalAmount;

    transaction.creditPaidAmount = alreadyPaid + paymentAmount;

    // Add to payment history
    const paymentHistory = transaction.creditPaymentHistory || [];
    const newRemainingAmount = totalAmount - transaction.creditPaidAmount;
    paymentHistory.push({
      date: new Date().toISOString(),
      amount: paymentAmount,
      remainingAmount: newRemainingAmount,
    });
    transaction.creditPaymentHistory = paymentHistory;

    // Update status if fully paid
    if (transaction.creditPaidAmount >= totalAmount) {
      transaction.status = 'payed';
    }

    // Update next due date
    if (transaction.creditNextDueDate && transaction.status === 'unpayed') {
      const nextDue = new Date(transaction.creditNextDueDate);
      switch (transaction.creditFrequency) {
        case CreditFrequency.WEEKLY:
          nextDue.setDate(nextDue.getDate() + 7);
          break;
        case CreditFrequency.MONTHLY:
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case CreditFrequency.YEARLY:
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          break;
      }
      transaction.creditNextDueDate = nextDue;
    }

    // Reset overdue status if payment made
    transaction.creditOverdue = false;

    await this.transactionRepo.save(transaction);

    // Update stock prices with the payment amount (proportionally)
    for (const item of transaction.items) {
      const stock = await this.stockRepo.findOne({
        where: {
          [transaction.shop ? 'shop' : 'warehouse']: {
            id: transaction.shop
              ? transaction.shop.id
              : transaction.warehouse.id,
          },
          product: { id: item.product.id },
        },
      });

      if (stock) {
        // Calculate the item's proportion of the total transaction
        const itemTotal = Number(item.finalPrice || item.price * item.quantity);
        const itemRatio = itemTotal / totalAmount;
        const itemPaymentAmount = paymentAmount;

        console.log('Stock Price Update Debug:', {
          productId: item.product.id,
          itemTotal,
          totalAmount,
          itemRatio,
          paymentAmount,
          itemPaymentAmount,
          oldStockPrice: Number(stock.price),
          newStockPrice: Number(stock.price) + itemPaymentAmount,
        });

        // Update stock price with the proportional payment
        stock.price = Number(
          (Number(stock.price) + itemPaymentAmount).toFixed(2),
        );

        await this.stockRepo.save(stock);
      }
    }

    return {
      paidAmount: paymentAmount,
      remainingAmount: totalAmount - transaction.creditPaidAmount,
      status: transaction.status,
    };
  }

  async checkOverdueCredits(): Promise<SalesTransaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const creditTransactions = await this.transactionRepo.find({
      where: {
        paymentMethod: 'credit' as any,
        status: 'unpayed',
      },
    });

    const overdueTransactions: SalesTransaction[] = [];

    for (const transaction of creditTransactions) {
      if (transaction.creditNextDueDate) {
        const dueDate = new Date(transaction.creditNextDueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate < today) {
          transaction.creditOverdue = true;
          transaction.creditMissedPayments++;
          await this.transactionRepo.save(transaction);
          overdueTransactions.push(transaction);
        }
      }
    }

    return overdueTransactions;
  }

  async getOverdueCredits(): Promise<SalesTransaction[]> {
    return this.transactionRepo.find({
      where: {
        paymentMethod: 'credit' as any,
        status: 'unpayed',
        creditOverdue: true,
      },
      relations: ['customer', 'shop', 'warehouse'],
      order: { creditNextDueDate: 'ASC' },
    });
  }

  async getCreditTransactions(
    shopId?: string,
    warehouseId?: string,
  ): Promise<SalesTransaction[]> {
    const where: any = {
      paymentMethod: 'credit',
    };

    if (shopId) {
      where.shop = { id: shopId };
    } else if (warehouseId) {
      where.warehouse = { id: warehouseId };
    }

    return this.transactionRepo.find({
      where,
      relations: ['items', 'items.product', 'shop', 'warehouse', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }
}
