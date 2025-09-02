import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756821159387 implements MigrationInterface {
    name = 'Init1756821159387'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sales_transaction_status_enum" AS ENUM('unpayed', 'payed')`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "status" "public"."sales_transaction_status_enum" NOT NULL DEFAULT 'unpayed'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."sales_transaction_status_enum"`);
    }

}
