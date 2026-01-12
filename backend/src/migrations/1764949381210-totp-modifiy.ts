import { MigrationInterface, QueryRunner } from 'typeorm';

export class TotpModifiy1764949381210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "password_reset"
          ADD COLUMN "expiry" VARCHAR(50) NOT NULL,
          ADD COLUMN "completedAt" TIMESTAMP DEFAULT NULL;
          ALTER TABLE "password_reset"
          RENAME COLUMN "resetToken" TO "otp";
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "password_reset"
          DROP COLUMN "expiry",
          DROP COLUMN "completedAt";
          ALTER TABLE "password_reset"
          RENAME COLUMN "otp" TO "resetToken";
      `
    );
  }
}
