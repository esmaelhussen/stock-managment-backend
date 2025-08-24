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
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../entities/user.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StockTransactionController = class StockTransactionController {
    stockTransactionService;
    constructor(stockTransactionService) {
        this.stockTransactionService = stockTransactionService;
    }
    create(createStockTransactionDto, user) {
        return this.stockTransactionService.handleTransaction(createStockTransactionDto.productId, createStockTransactionDto.quantity, createStockTransactionDto.type, user.warehouseId, createStockTransactionDto.targetWarehouseId);
    }
    async getAllTransactions(user) {
        return this.stockTransactionService.getAllTransactions(user.warehouseId);
    }
    async getAllStock(user) {
        return this.stockTransactionService.getAllStock(user.warehouseId);
    }
};
exports.StockTransactionController = StockTransactionController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_transaction_dto_1.CreateStockTransactionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StockTransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], StockTransactionController.prototype, "getAllTransactions", null);
__decorate([
    (0, common_1.Get)('all-stock'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], StockTransactionController.prototype, "getAllStock", null);
exports.StockTransactionController = StockTransactionController = __decorate([
    (0, common_1.Controller)('stock-transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stockTransaction_service_1.StockTransactionService])
], StockTransactionController);
//# sourceMappingURL=stockTransaction.controller.js.map