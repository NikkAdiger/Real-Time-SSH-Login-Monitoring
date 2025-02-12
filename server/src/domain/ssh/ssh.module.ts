import { Module } from '@nestjs/common';
import { SshService } from './services/ssh.service';
import { SshGateway } from './services/ssh.gateway';
import LoginEventRepository from './repositories/loginEvent.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginEventEntity } from './entities/loginEvent.entity';
import { LoginEventController } from './controllers/loginEvent.controller';

@Module({
  	imports: [
		TypeOrmModule.forFeature([LoginEventEntity]),
	],
	controllers: [LoginEventController],
	providers: [
		SshService, 
		SshGateway,
		LoginEventRepository,
	],
	exports: [SshService],
})

export class SshModule {}