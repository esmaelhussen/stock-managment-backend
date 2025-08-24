"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransactionController = void 0;
const common_1 = require("@nestjs/common");
const stockTransaction_service_1 = require("./stockTransaction.service");
const create_stock_transaction_dto_1 = require("./dto/create-stock-transaction.dto");
let StockTransactionController = class StockTransactionController {
    stockTransactionService;
    constructor(stockTransactionService) {
        this.stockTransactionService = stockTransactionService;
    }
    create(createStockTransactionDto) {
        return this.stockTransactionService.handleTransaction(createStockTransactionDto.productId, createStockTransactionDto.quantity, createStockTransactionDto.type, createStockTransactionDto.sourceWarehouseId, createStockTransactionDto.targetWarehouseId);
    }
    async getAllTransactions() {
        return this.stockTransactionService.getAllTransactions();
    }
    async getAllStock() {
        return this.stockTransactionService.getAllStock();
    }
};
exports.StockTransactionController = StockTransactionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_transaction_dto_1.CreateStockTransactionDto]),
    __metadata("design:returntype", void 0)
], StockTransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockTransactionController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Get)('all-stock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StockTransactionController.prototype, "getAllStock", null);
exports.StockTransactionController = StockTransactionController = __decorate([
    (0, common_1.Controller)('stock-transactions'),
    __metadata("design:paramtypes", [stockTransaction_service_1.StockTransactionService])
], StockTransactionController);
//# sourceMappingURL=stockTransaction.controller.js.map