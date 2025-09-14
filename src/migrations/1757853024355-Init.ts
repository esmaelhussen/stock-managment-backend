import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757853024355 implements MigrationInterface {
    name = 'Init1757853024355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET NOT NULL`);
    }

}
