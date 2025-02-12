import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1739102904257 implements MigrationInterface {
	name = 'init1739102904257';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "history" (
				"id" bigserial PRIMARY KEY NOT NULL,
				"username" varchar(255),
				"ip" INET,
				"host" varchar(255),
				"status" varchar(50),
				"auth_method" varchar(50),
				"timestamp" TIMESTAMP WITH TIME ZONE,
				"created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
			);

			CREATE INDEX "IDX_history_username" ON "history" ("username");
			CREATE INDEX "IDX_history_ip" ON "history" ("ip");
			CREATE INDEX "IDX_history_timestamp" ON "history" ("timestamp");
			
		`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "history";`);
	}
}
