import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetAddVerifiedColumn1764866080157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "password_reset"
          ADD "verified" BOOLEAN NOT NULL DEFAULT FALSE
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "password_reset"
          DROP COLUMN "verified"
      `
    );
  }
}
