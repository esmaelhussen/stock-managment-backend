import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StockTransaction,
  TransactionType,
} from '../../entities/stockTransaction.entity';
import { Stock } from '../../entities/stock.entity';
import { Warehouse } from '../../entities/warehouse.entity';
import { Product } from '../../entities/product.entity';

@Injectable()
export class StockTransactionService {
  constructor(
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,

    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async handleTransaction(
    productId: string,
    quantity: number,
    type: TransactionType, // Updated to use TransactionType enum
    sourceWarehouseId: string,
    targetWarehouseId?: string,
  ): Promise<StockTransaction> {
    // Fetch the product by its ID
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Product not found');

    // Ensure product price is valid
    if (product.price === null || product.price === undefined) {
      throw new BadRequestException('Product price is not set');
    }

    // Fetch the source warehouse by its ID
    const sourceWarehouse = await this.warehouseRepository.findOne({
      where: { id: sourceWarehouseId },
    });
    if (!sourceWarehouse)
      throw new BadRequestException('Source warehouse not found');

    const targetWarehouse = await this.warehouseRepository.findOne({
      where: { id: targetWarehouseId },
    });
    if (!targetWarehouse)
      throw new BadRequestException('Target warehouse not found');

    // Calculate price based on transaction type

    if (type === TransactionType.ADD) {
      let stock = await this.stockRepository.findOne({
        where: {
          warehouse: { id: sourceWarehouseId },
          product: { id: productId },
        },
      });

      if (stock) {
        // Update stock quantity and calculate weighted average price
        const totalQuantity = stock.quantity + quantity;
        stock.price = Number(product.price) * quantity + Number(stock.price);
        stock.quantity = totalQuantity;
      } else {
        // Create new stock record
        stock = this.stockRepository.create({
          warehouse: sourceWarehouse,
          product,
          quantity,
          price: quantity * product.price, // Use product price directly for new stock
        });
      }

      await this.stockRepository.save(stock);
    } else if (type === TransactionType.REMOVE) {
      const stock = await this.stockRepository.findOne({
        where: {
          warehouse: { id: sourceWarehouseId },
          product: { id: productId },
        },
      });

      if (!stock || stock.quantity < quantity) {
        throw new BadRequestException('Insufficient stock to remove');
      }

      // Reduce stock quantity
      stock.quantity -= quantity;
      stock.price -= quantity * product.price;
      await this.stockRepository.save(stock);
    } else if (type === TransactionType.TRANSFER) {
      if (!targetWarehouseId) {
        throw new BadRequestException(
          'Target warehouse is required for transfer',
        );
      }

      if (sourceWarehouseId === targetWarehouseId) {
        throw new BadRequestException(
          'Source and target warehouse cannot be the same',
        );
      }

      const sourceStock = await this.stockRepository.findOne({
        where: {
          warehouse: { id: sourceWarehouseId },
          product: { id: productId },
        },
      });

      if (
        !sourceStock ||
        sourceStock.quantity < quantity ||
        sourceStock.price < quantity * product.price
      ) {
        throw new BadRequestException('Insufficient stock to transfer');
      }

      // Reduce source stock quantity
      sourceStock.quantity -= quantity;
      sourceStock.price -= quantity * product.price;
      await this.stockRepository.save(sourceStock);

      let targetStock = await this.stockRepository.findOne({
        where: {
          warehouse: { id: targetWarehouseId },
          product: { id: productId },
        },
      });

      if (targetStock) {
        // Update target stock quantity and calculate weighted average price
        targetStock.quantity += quantity;
        targetStock.price =
          Number(targetStock.price) + quantity * product.price;
      } else {
        // Create new stock record
        targetStock = this.stockRepository.create({
          warehouse: targetWarehouse,
          product,
          quantity,
          price: product.price * quantity, // Use product price directly for new stock
        });
      }

      await this.stockRepository.save(targetStock);
    }

    // Log the transaction in the StockTransaction table
    const transaction = this.stockTransactionRepository.create({
      product,
      quantity,
      price: product.price * quantity,
      type, // Ensure the transaction type is set
      sourceWarehouse:
        type === TransactionType.REMOVE ||
        type === TransactionType.TRANSFER ||
        type === TransactionType.ADD
          ? sourceWarehouse
          : undefined,
      targetWarehouse:
        type === TransactionType.TRANSFER ? targetWarehouse : undefined,
    });

    // Save the transaction record
    return this.stockTransactionRepository.save(transaction);
  }

  //   async getStockByWarehouse(warehouseId: string) {
  //     // Fetch all stock records for a specific warehouse
  //     return this.stockRepository.find({
  //       where: { warehouse: { id: warehouseId } },
  //       relations: ['product', 'warehouse'],
  //     });
  //   }

  async getAllTransactions() {
    // Fetch all stock transactions with related entities
    return this.stockTransactionRepository.find({
      relations: ['sourceWarehouse', 'targetWarehouse', 'product', 'stock'],
    });
  }

  async getAllStock() {
    // Fetch all stock records with related entities
    return this.stockRepository.find({
      relations: ['product', 'warehouse'],
    });
  }
}
