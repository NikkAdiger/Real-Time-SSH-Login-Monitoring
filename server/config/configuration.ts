import { registerAs } from '@nestjs/config';

export default registerAs('config', () => (
	{
		logFile: process.env.LOG_FILE || '/var/log/auth.log',
		apiPort: parseInt(process.env.API_PORT, 10) || 3010,
		db: {
			host: process.env.DB_HOST,
			port: parseInt(process.env.DB_PORT, 10) || 5432,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			synchronize: process.env.DB_SYNCHRONIZE,
			logging: process.env.DB_LOGGING,
			runMigrations: process.env.DB_RUN_MIGRATIONS,
		}
	}
));