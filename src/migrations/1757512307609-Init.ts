import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757512307609 implements MigrationInterface {
    name = 'Init1757512307609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "transactedById" uuid`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD CONSTRAINT "FK_ccccdc592f450cde9e20118d23a" FOREIGN KEY ("transactedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP CONSTRAINT "FK_ccccdc592f450cde9e20118d23a"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "transactedById"`);
    }

}
