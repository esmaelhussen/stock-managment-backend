import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756107908317 implements MigrationInterface {
    name = 'Init1756107908317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD "transactedById" uuid`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_fa5c034ff274a8ae3a7c6c737ee" FOREIGN KEY ("transactedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_fa5c034ff274a8ae3a7c6c737ee"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP COLUMN "transactedById"`);
    }

}
