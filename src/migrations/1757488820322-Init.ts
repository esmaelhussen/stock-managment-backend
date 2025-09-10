import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757488820322 implements MigrationInterface {
    name = 'Init1757488820322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD "warehouseId" uuid`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" ADD CONSTRAINT "FK_4d5dd1c68ccb349e5348c5d2d75" FOREIGN KEY ("warehouseId") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP CONSTRAINT "FK_4d5dd1c68ccb349e5348c5d2d75"`);
        await queryRunner.query(`ALTER TABLE "sales_transaction" DROP COLUMN "warehouseId"`);
    }

}
