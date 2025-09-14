import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757852867430 implements MigrationInterface {
    name = 'Init1757852867430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "customerType" SET DEFAULT 'Walk-In'`);
    }

}
