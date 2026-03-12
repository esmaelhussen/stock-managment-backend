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
    type: TransactionType,
    sourceWarehouseId?: string,
    targetWarehouseId?: string,
    sourceShopId?: string,
    targetShopId?: string,
    transactedById?: string,
  ): Promise<StockTransaction> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new BadRequestException('Product not found');
    if (product.price == null)
      throw new BadRequestException('Product price is not set');

    const transactedBy = await this.userRepository.findOne({
      where: { id: transactedById },
    });
    if (!transactedBy) throw new BadRequestException('User not found');

    // Resolve source
    const sourceWarehouse = sourceWarehouseId
      ? await this.warehouseRepository.findOne({
          where: { id: sourceWarehouseId },
        })
      : null;
    const sourceShop = sourceShopId
      ? await this.shopRepository.findOne({ where: { id: sourceShopId } })
      : null;

    if (!sourceWarehouse && !sourceShop) {
      throw new BadRequestException('Source warehouse or shop not found');
    }

    // Resolve target (only required for TRANSFER)
    const targetWarehouse = targetWarehouseId
      ? await this.warehouseRepository.findOne({
          where: { id: targetWarehouseId },
        })
      : null;
    const targetShop = targetShopId
      ? await this.shopRepository.findOne({ where: { id: targetShopId } })
      : null;

    if (type === TransactionType.TRANSFER && !targetWarehouse && !targetShop) {
      throw new BadRequestException('Target warehouse or shop not found');
    }

    // -------------------------
    // ADD stock
    // -------------------------
    if (type === TransactionType.ADD) {
      let stock = await this.stockRepository.findOne({
        where: sourceWarehouse
          ? {
              warehouse: { id: sourceWarehouse.id },
              product: { id: productId },
            }
          : sourceShop
            ? { shop: { id: sourceShop.id }, product: { id: productId } }
            : undefined,
      });

      if (stock) {
        stock.quantity = Number(stock.quantity);
        stock.price = Number(stock.price);

        stock.quantity += quantity;
        stock.price += quantity * product.price;
      } else {
        stock = this.stockRepository.create({
          product,
          quantity,
          price: quantity * product.price,
          warehouse: sourceWarehouse ?? undefined,
          shop: sourceShop ?? undefined,
        });
      }
      await this.stockRepository.save(stock);
    }

    // -------------------------
    // REMOVE stock
    // -------------------------
    else if (type === TransactionType.REMOVE) {
      const stock = await this.stockRepository.findOne({
        where: sourceWarehouse
          ? {
              warehouse: { id: sourceWarehouse.id },
              product: { id: productId },
            }
          : sourceShop
            ? { shop: { id: sourceShop.id }, product: { id: productId } }
            : undefined,
      });

      if (!stock || stock.quantity < quantity) {
        throw new BadRequestException('Insufficient stock to remove');
      }

      stock.quantity -= quantity;
      stock.price -= quantity * product.price;
      await this.stockRepository.save(stock);
    }

    // -------------------------
    // TRANSFER stock
    // -------------------------
    else if (type === TransactionType.TRANSFER) {
      // Fetch source stock
      const sourceStock = await this.stockRepository.findOne({
        where: sourceWarehouse
          ? {
              warehouse: { id: sourceWarehouse.id },
              product: { id: productId },
            }
          : sourceShop
            ? { shop: { id: sourceShop.id }, product: { id: productId } }
            : undefined,
      });

      if (!sourceStock || sourceStock.quantity < quantity) {
        throw new BadRequestException('Insufficient stock to transfer');
      }

      // Fetch/Create target stock
      let targetStock = await this.stockRepository.findOne({
        where: targetWarehouse
          ? {
              warehouse: { id: targetWarehouse.id },
              product: { id: productId },
            }
          : targetShop
            ? { shop: { id: targetShop.id }, product: { id: productId } }
            : undefined,
      });

      if (sourceStock.id === targetStock?.id) {
        throw new BadRequestException('Source and target cannot be the same');
      }

      if (targetStock) {
        targetStock.quantity = Number(targetStock.quantity);
        targetStock.price = Number(targetStock.price);

        targetStock.quantity += quantity;
        targetStock.price += quantity * product.price;
      } else {
        targetStock = this.stockRepository.create({
          product,
          quantity,
          price: quantity * product.price,
          warehouse: targetWarehouse ?? undefined,
          shop: targetShop ?? undefined,
        });
      }

      sourceStock.quantity -= quantity;
      sourceStock.price -= quantity * product.price;
      await this.stockRepository.save(sourceStock);
      await this.stockRepository.save(targetStock);
    }

    // -------------------------
    // Log transaction
    // -------------------------
    const transaction = new StockTransaction();
    Object.assign(transaction, {
      product,
      quantity,
      price: product.price * quantity,
      type,
      sourceWarehouse,
      sourceShop,
      targetWarehouse,
      targetShop,
      transactedBy,
    });

    return this.stockTransactionRepository.save(transaction);
  }

  // async transferToShop(
  //   productId: string,
  //   quantity: number,
  //   warehouseId: string,

  //   shopId: string,
  //   transactedById: string,
  // ): Promise<StockTransaction> {a
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
