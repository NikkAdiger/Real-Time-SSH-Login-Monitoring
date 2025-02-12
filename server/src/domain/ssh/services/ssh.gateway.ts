import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ILoginEvent } from '../types/interfaces';

@WebSocketGateway({
	cors: {
		origin: "*", // will be specific origins in production!
		methods: ["GET"]
	}
})
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;

	afterInit() {
		console.log('SSH Gateway initialized')
		console.log(`Total clients connected: ${this.server.engine.clientsCount}`);
	}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		console.log(`Total clients connected: ${this.server.engine.clientsCount}`);
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		console.log(`Total clients connected: ${this.server.engine.clientsCount}`);
	}

	broadcastEvent(event: Omit<ILoginEvent, 'id'>) {
		if (!this.server) {
			console.error("WebSocket server is not initialized yet.");
			return;
		}
		this.server.emit('login-event', event);
	}
}