import { Injectable } from '@nestjs/common';
import { Tail } from 'tail';
import { ILoginEvent, ILoginEventHistory } from '../types/interfaces';
import LoginEventRepository from '../repositories/loginEvent.repository';
import { SshGateway } from './ssh.gateway';
import { ConfigService } from '@nestjs/config';
import { Address4, Address6 } from 'ip-address';

@Injectable()
export class SshService {
	private tailer: Tail;

	constructor(
		private configService: ConfigService,
		private loginEventRepository: LoginEventRepository,
		private sshGateway: SshGateway,
	) {}

	async onModuleInit() {
		// Only for Ubuntu & Debian-based systems:
		// For CentOS, RHEL, and Fedora the log file is /var/log/secure
		const logFile = this.configService.get('config.logFile');
		const logFilePath = logFile || '/var/log/auth.log';

		try {
			// Uncomment this block if you want to process existing log lines
			// const existingLogData = await this.readExistingLogLines(logFilePath);
			// for (const line of existingLogData) {
			// 	this.processLogLine(line)
			// }

			this.tailer = new Tail(logFilePath);
			this.tailer.on('line', this.processLogLine.bind(this));
			console.log("SSH Log Monitoring started...");

		} catch (error) {
			console.error("Error initializing log monitoring:", error);
		}
	}

	async saveLoginEvent(event: ILoginEvent) {
		try {
			await this.loginEventRepository.save(event);
		} catch (error) {
			console.error("Error saving login event:", error);
		}
	}

	async processLogLine(line: string) {
		try {
			const parsedLog = this.parseSSHLog(line);
	
			if (parsedLog) {
				const event: ILoginEvent = {
					...parsedLog,
				};
	
				await this.saveLoginEvent(event);
				this.sshGateway.broadcastEvent(event);
			}
		} catch (error) {
			console.error("Error processing log line:", error);
		}
	}

	parseSSHLog(line: string): Omit<ILoginEvent, 'id'> | null {
		const isoRegex = /^(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+\-]\d{2}:\d{2})?) (?<host>[^\s]+) sshd\[\d+\]: (?<message>.+)$/;
		const traditionalRegex = /^(?<timestamp>\w{3} \d{1,2} \d{2}:\d{2}:\d{2}) (?<host>[^\s]+) sshd\[\d+\]: (?<message>.+)$/;
	
		const isoMatch = line.match(isoRegex);
		const traditionalMatch = line.match(traditionalRegex);
		const match = traditionalMatch || isoMatch;
	
		if (!match) {
			return null;
		}
	
		let { timestamp, host, message } = match.groups;
		let date: Date;

		if (traditionalMatch) {	
			const [month, day, time] = timestamp.split(" ");
			const year = new Date().getFullYear();
			date = new Date(`${month} ${day} ${year} ${time}`);
		} else {
			date = new Date(timestamp);
		}
	
		if (!isNaN(date.getTime())) {
			timestamp = date.toISOString();
		}
		
		let username, status, ip, authMethod;
	
		const failedRegex = /Failed password for (invalid user )?(?<username>[^\s]+) from (?<ip>[^\s]+)/;
		const acceptedRegex = /Accepted (?<authMethod>\w+) for (?<username>[^\s]+) from (?<ip>[^\s]+)/;
		const invalidUserRegex = /Invalid user (?<username>[^\s]+) from (?<ip>[^\s]+)/;
		const disconnectedRegex = /Received disconnect from (?<ip>[^\s]+)/;
		const pamRegex = /pam_unix\(sshd:auth\): (?:check pass; )?(?:user unknown|authentication failure); logname=.* ruser=.* rhost=(?<ip>[^\s]+)/;
		
		let messageMatch = message.match(failedRegex) || message.match(acceptedRegex) || message.match(invalidUserRegex) || message.match(disconnectedRegex) || message.match(pamRegex);
	
		if (messageMatch) {
			({ username, ip } = messageMatch.groups);
	
			if (message.includes("Failed password")) {
				status = "Invalid password";
			} else if (message.includes("Accepted")) {
				status = "Accepted";
				authMethod = messageMatch.groups.authMethod;
			} else if (message.includes("Invalid user")) {
				status = "Invalid user";
			} else if (message.includes("Received disconnected")) {
				status = "Disconnected";
			} else if (message.includes("pam_unix")) {
				status = "Failed";
			}
		} else {
		  console.warn("Unmatched log line message:", message);
		  return null;
		}
	
		return {
			timestamp:  new Date(timestamp),
			host:       host || null,
			username:   username || null,
			status: 	status || null,
			ip: 		this.isValidIP(ip) ? ip : null,
			authMethod: authMethod || null,
		};
	}	

	async getLoginHistory({ search, page, limit }): Promise<ILoginEventHistory> {
		const { data, total } = await this.loginEventRepository.getAllLoginEvents({ search, page, limit });
		return { data, total, page, limit };
	}

	private isValidIP(ipAddress: string): boolean {
		const ip = ipAddress.replace(/[\[\]]/g, '');
		return Address4.isValid(ip) || Address6.isValid(ip);
	}

	// Uncomment this block if you want to process existing log lines
	// private async readExistingLogLines(filePath: string): Promise<string[]> {
	// 	try {
	// 		const data = await fs.readFile(filePath, 'utf8');
	// 		return data.split('\n').filter(line => line.trim() !== '');
	// 	} catch (error) {
	// 		console.error(`Error reading existing log lines: ${error}`);
	// 		return [];
	// 	}
	// }
}