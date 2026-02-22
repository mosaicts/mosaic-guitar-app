import { MigrationInterface, QueryRunner } from 'typeorm';

export class CartItems1771210866815 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TABLE cart_items  (
            cart_id uuid REFERENCES cart (id) ON DELETE RESTRICT,
            product_id text REFERENCES product (id) ON DELETE RESTRICT,
            quantity integer,
            discount numeric,
            PRIMARY KEY (cart_id, product_id)
          );
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE cart_items`);
  }
}
