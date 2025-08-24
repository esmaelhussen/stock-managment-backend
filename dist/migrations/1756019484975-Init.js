"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init1756019484975 = void 0;
class Init1756019484975 {
    name = 'Init1756019484975';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "stock" ADD "timestamp" TIMESTAMP NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "stock" DROP COLUMN "timestamp"`);
    }
}
exports.Init1756019484975 = Init1756019484975;
//# sourceMappingURL=1756019484975-Init.js.map