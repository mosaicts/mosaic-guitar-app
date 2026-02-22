import { MigrationInterface, QueryRunner } from 'typeorm';

export class Order1769945649037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TYPE order_status AS ENUM ('cancelled', 'success', 'failed', 'in-progress');

          CREATE TABLE "order"  (
            id integer PRIMARY KEY,
            user_id uuid REFERENCES "user" (id) ON DELETE RESTRICT,
            shipping_address text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp,
            status order_status
          );
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order"`);
  }
}
