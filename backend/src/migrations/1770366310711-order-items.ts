import { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderItems1770366310711 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` 
          CREATE TABLE order_items  (
            order_id integer REFERENCES "order" (id) ON DELETE CASCADE,
            product_id text REFERENCES product (id) ON DELETE RESTRICT,
            quantity integer,
            discount numeric,
            PRIMARY KEY (order_id, product_id)
          );
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE order_items`);
  }
}
