import { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleAuth1766935369161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "user"
          ADD COLUMN provider text,
          ADD COLUMN googleId text,
          ADD COLUMN facebookId text
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "user"
          DROP COLUMN provider,
          DROP COLUMN googleId,
          DROP COLUMN facebookId,
      `
    );
  }
}
