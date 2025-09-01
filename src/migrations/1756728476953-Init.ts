import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756728476953 implements MigrationInterface {
    name = 'Init1756728476953'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sales_transaction_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(12,2) NOT NULL, "totalPrice" numeric(12,2) NOT NULL, "salesTransactionId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_40c78927ffbb1a1fff3465f2989" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sales_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "paymentMethod" "public"."sales_transaction_paymentmethod_enum" NOT NULL, "creditorName" character varying, "totalPrice" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "shopId" uuid NOT NULL, CONSTRAINT "PK_000ae4a84cb4f52cb1bd99e033e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD CONSTRAINT "FK_456500d6a89574abd6de6415fd4" FOREIGN KEY ("salesTransactionId") REFERENCES "sales_transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" ADD CONSTRAINT "FK_e6e978264200f24fb17f0489b3f" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD CONSTRAINT "FK_87cbb5b3fd252664e523d31cef9" FOREIGN KEY ("shopId") REFERENCES "shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP CONSTRAINT "FK_87cbb5b3fd252664e523d31cef9"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP CONSTRAINT "FK_e6e978264200f24fb17f0489b3f"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction_item" DROP CONSTRAINT "FK_456500d6a89574abd6de6415fd4"`);
        await queryRunner.query(`DROP TABLE "sales_transaction"`);
        await queryRunner.query(`DROP TABLE "sales_transaction_item"`);
    }

}
