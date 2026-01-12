import { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleAuth1766935369161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "user"
          ADD COLUMN "provider" VARCHAR(50) DEFAULT NULL,
          ADD COLUMN "googleId" VARCHAR DEFAULT NULL,
          ADD COLUMN "facebookId" VARCHAR DEFAULT NULL,
          DROP COLUMN "profilePicUpdatedAt";
          ALTER TABLE "user"
          RENAME COLUMN "profilePicUrl" TO "avatar";
          ALTER TABLE "user"
          ALTER COLUMN "avatar" DROP NOT NULL;
      `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
          ALTER TABLE "user"
          DROP COLUMN "provider",
          DROP COLUMN "googleId",
          DROP COLUMN "facebookId",
          ADD COLUMN "profilePicUpdatedAt" TIMESTAMP NOT NULL DEFAULT now();
          ALTER TABLE "user"
          RENAME COLUMN "avatar" TO "profilePicUrl";
          ALTER TABLE "user"
          ALTER COLUMN "profilePicUrl" SET NOT NULL;
      `
    );
  }
}
