import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757846318269 implements MigrationInterface {
    name = 'Init1757846318269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "walkInCustomerName" character varying`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "customerId" uuid`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD CONSTRAINT "FK_e618f28ef812e9172b47e48792c" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP CONSTRAINT "FK_e618f28ef812e9172b47e48792c"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "customerId"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "walkInCustomerName"`);
        await queryRunner.query(`DROP TABLE "customer"`);
    }

}
