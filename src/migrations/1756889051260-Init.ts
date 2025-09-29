import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756889051260 implements MigrationInterface {
    name = 'Init1756889051260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_89426d5e6cae3fd4c02dde4db86"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP COLUMN "warehouse_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shop" ADD "warehouse_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_89426d5e6cae3fd4c02dde4db86" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
