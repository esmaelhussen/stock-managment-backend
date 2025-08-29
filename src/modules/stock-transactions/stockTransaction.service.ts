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
import { User } from 'src/entities/user.entity';
import { Shop } from '../../entities/shop.entity';

@Injectable()
export class StockTransactionService {
  constructor(
    @InjectRepository(StockTransaction)
    private readonly stockTransactionRepository: Repository<StockTransaction>,

    @InjectRepository(Stock)
    private readonly stockRepository: Repository<Stock>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async handleTransaction(
    productId: string,
    quantity: number,
    type: TransactionType, // Updated to use TransactionType enum
    sourceWarehouseId?: string,
    targetWarehouseId?: string,
    sourceShopId?: string,
    targetShopId?: string,
    transactedById?: string,
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

    const transactedBy = await this.userRepository.findOne({
      where: { id: transactedById },
    });
    if (!transactedBy) throw new BadRequestException('User not found');

    // Fetch the source warehouse by its ID
    const sourceWarehouse = await this.warehouseRepository.findOne({
      where: { id: sourceWarehouseId },
    });
    if (!sourceWarehouse)
      throw new BadRequestException('Source warehouse not found');

    let targetWarehouse: Warehouse | undefined = undefined;
    if (type === TransactionType.TRANSFER && targetWarehouseId) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: targetWarehouseId },
      });
      if (!warehouse)
        throw new BadRequestException('Target warehouse not found');
      targetWarehouse = warehouse;
    }
    if (!transactedById) {
      throw new BadRequestException('Transacted by user is required');
    }

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

        stock.price = Number(stock.price);
        product.price = Number(product.price);
        stock.price += quantity * product.price;
        stock.quantity += quantity;
      } else {
        // Create new stock record
        stock = this.stockRepository.create({
          warehouse: sourceWarehouse,
          product,
          quantity,
          price: quantity * product.price,

          // Use product price directly for new stock
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

      // Reduce stock quantity (price per unit remains the same)
      stock.quantity -= quantity;
      // stock.price = Number(stock.price);
      // product.price = Number(product.price);
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
        sourceStock.price <= 0
      ) {
        throw new BadRequestException('Insufficient stock to transfer');
      }

      // Reduce source stock quantity (price per unit remains the same)
      sourceStock.price -= quantity * product.price; // Keep track of source price
      sourceStock.quantity -= quantity;
      await this.stockRepository.save(sourceStock);

      let targetStock = await this.stockRepository.findOne({
        where: {
          warehouse: { id: targetWarehouseId },
          product: { id: productId },
        },
      });

      if (targetStock) {
        // Update target stock quantity and calculate weighted average price
        targetStock.price = Number(targetStock.price);
        product.price = Number(product.price);

        targetStock.price += quantity * product.price;
        targetStock.quantity += quantity;
      } else {
        // Create new stock record
        targetStock = this.stockRepository.create({
          warehouse: targetWarehouse!,
          product,
          quantity,
          price: quantity * product.price, // Use transfer price from source
        });
      }

      await this.stockRepository.save(targetStock);
    }

    // Log the transaction in the StockTransaction table
    const transaction = this.stockTransactionRepository.create({
      product,
      quantity,
      price: product.price * quantity, // Store unit price, not total
      type,
      sourceWarehouse,
      targetWarehouse:
        type === TransactionType.TRANSFER && targetWarehouse
          ? targetWarehouse
          : undefined,
      transactedBy,
    });

    // Save the transaction record
    return this.stockTransactionRepository.save(transaction);
  }

  // async transferToShop(
  //   productId: string,
  //   quantity: number,
  //   warehouseId: string,
  //   shopId: string,
  //   transactedById: string,
  // ): Promise<StockTransaction> {
  //   const warehouse = await this.warehouseRepository.findOne({
  //     where: { id: warehouseId },
  //   });
  //   const shop = await this.shopRepository.findOne({ where: { id: shopId } });
  //   const product = await this.productRepository.findOne({
  //     where: { id: productId },
  //   });
  //   const transactedBy = await this.userRepository.findOne({
  //     where: { id: transactedById },
  //   });
  //
  //   if (!warehouse || !shop || !product || !transactedBy) {
  //     throw new BadRequestException('Invalid warehouse, shop, product, or user');
  //   }
  //
  //   const stock = await this.stockRepository.findOne({
  //     where: { warehouse: { id: warehouseId }, product: { id: productId } },
  //   });
  //
  //   if (!stock || stock.quantity < quantity) {
  //     throw new BadRequestException('Insufficient stock in warehouse');
  //   }
  //
  //   stock.quantity -= quantity;
  //   await this.stockRepository.save(stock);
  //
  // //   let shopStock = await this.stockRepository.findOne({
  // //     where: { shop: { id: shopId }, product: { id: productId } },
  // //   });
  // //
  // //   if (shopStock) {
  // //     // Update shop stock quantity and calculate weighted average price
  // //     shopStock.price =
  // //       (shopStock.price * shopStock.quantity + product.price * quantity) /
  // //       (shopStock.quantity + quantity);
  // //     shopStock.quantity += quantity;
  // //   } else {
  // //     // Create new shop stock record
  // //     shopStock = this.stockRepository.create({
  // //       shop,
  // //       product,
  // //       quantity,
  // //       price: product.price, // Use product price for new stock
  // //     });
  // //   }
  // //
  // //   await this.stockRepository.save(shopStock);
  // //
  //   const transaction = this.stockTransactionRepository.create({
  //     product,
  //     quantity,
  //     price: product.price * quantity, // Store total price for the transaction
  //     type: TransactionType.TRANSFER,
  //     sourceWarehouse: warehouse,
  //     shop,
  //     transactedBy,
  //   });
  //
  //   return this.stockTransactionRepository.save(transaction);
  // }

  //   async getStockByWarehouse(warehouseId: string) {
  //     // Fetch all stock records for a specific warehouse
  //     return this.stockRepository.find({
  //       where: { warehouse: { id: warehouseId } },
  //       relations: ['product', 'warehouse'],
  //     });
  //   }

  async getAllTransactions(warehouseId: string) {
    // Fetch all stock transactions with related entities
    return this.stockTransactionRepository.find({
      where: [
        { sourceWarehouse: { id: warehouseId } },
        { targetWarehouse: { id: warehouseId } },
      ],
      relations: [
        'sourceWarehouse',
        'targetWarehouse',
        'product',
        'stock',
        'transactedBy',
      ],
    });
  }

  async getAllStock(warehouseId: string) {
    // Fetch all stock records with related entities
    return this.stockRepository.find({
      where: { warehouse: { id: warehouseId } },
      relations: ['product', 'warehouse'],
    });
  }
}
