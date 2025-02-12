import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SshModule } from './domain/ssh/ssh.module';
import { TypeOrmConfigService } from './shared/typeorm.service';
import configuration from 'config/configuration';

@Module({
  imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [ configuration ],
		}),
		TypeOrmModule.forRootAsync({
			useClass: TypeOrmConfigService,
		}),
    SshModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}