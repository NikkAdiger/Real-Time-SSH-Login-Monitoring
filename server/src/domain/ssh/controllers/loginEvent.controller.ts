import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SshService } from '../services/ssh.service';
import { GetLoginEventQueryDto } from '../dto/loginEvent.dto';

@Controller('events')
export class LoginEventController {
	constructor(
		private readonly sshService: SshService,
	) {}

    @Get()
    async getAllEvents(@Query() query: GetLoginEventQueryDto) {
        const { search, page, limit } = query;

		const pageNumber = page || 1;
		const pageSize = limit || 10;

		return await this.sshService.getLoginHistory({ search, page: pageNumber, limit: pageSize });
	}

	@Post()
	async createEvent(@Body() { line }: { line: string }) {
		this.sshService.processLogLine(line);
	}
}
