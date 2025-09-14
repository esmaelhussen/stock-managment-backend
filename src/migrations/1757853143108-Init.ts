import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757853143108 implements MigrationInterface {
    name = 'Init1757853143108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET DEFAULT 'Walk-In'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP NOT NULL`);
    }

}
