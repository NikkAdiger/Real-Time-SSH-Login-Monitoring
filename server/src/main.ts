import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: '1',
	});

	new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
	}),

	app.enableCors();

	const configService = app.get(ConfigService);
	const port = configService.get('config.apiPort');

	await app.listen(port);
	console.log(`Server listening on http://localhost:${port}`);
}

bootstrap();