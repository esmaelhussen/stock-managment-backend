import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756821406713 implements MigrationInterface {
    name = 'Init1756821406713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "paymentMethod" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ALTER COLUMN "paymentMethod" SET NOT NULL`);
    }

}
