import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1756912787797 implements MigrationInterface {
    name = 'Init1756912787797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "imageUrl" TO "image"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "image" TO "imageUrl"`);
    }

}
