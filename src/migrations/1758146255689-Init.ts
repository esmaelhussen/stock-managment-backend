import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1758146255689 implements MigrationInterface {
    name = 'Init1758146255689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditDuration" integer`);
        await queryRunner.query(`CREATE TYPE "public"."sales_transaction_creditfrequency_enum" AS ENUM('weekly', 'monthly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditFrequency" "public"."sales_transaction_creditfrequency_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditPaidAmount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditInstallmentAmount" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditStartDate" date`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditNextDueDate" date`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditPaymentHistory" text`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditMissedPayments" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "creditOverdue" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditOverdue"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditMissedPayments"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditPaymentHistory"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditNextDueDate"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditStartDate"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditInstallmentAmount"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditPaidAmount"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditFrequency"`);
        await queryRunner.query(`DROP TYPE "public"."sales_transaction_creditfrequency_enum"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "creditDuration"`);
    }

}
