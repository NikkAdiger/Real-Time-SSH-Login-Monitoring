import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join, normalize } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {

	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		const dbConfig = this.configService.get('config.db');

		return {
			type: 'postgres',
			host: dbConfig.host,
			port: dbConfig.port,
			database: dbConfig.database,
			username: dbConfig.username,
			password: dbConfig.password,
			synchronize: dbConfig.synchronize,
			logging: dbConfig.logging,
			autoLoadEntities: true,
			migrations: [ normalize(join(__dirname, '../migrations/*.js')) ],
			migrationsRun: !!dbConfig.runMigrations,
			retryAttempts: 5,
			retryDelay: 5000,
		};
	}
}
