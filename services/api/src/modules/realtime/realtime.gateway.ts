import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { DatabaseService } from '../../database/database.service';
import {
  SocketClientEvents,
  SocketServerEvents,
  DriverTelemetry,
  ChatMessage,
} from '@superapp/types';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly db: DatabaseService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(SocketClientEvents.SUBSCRIBE_REQUEST)
  handleSubscribeRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { requestId: string }
  ) {
    const room = `request:${data.requestId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room ${room}`);
    return { status: 'joined', room };
  }

  @SubscribeMessage(SocketClientEvents.PROVIDER_LOCATION_UPDATE)
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() telemetry: DriverTelemetry
  ) {
    const provider = this.db.providers.get(telemetry.providerId);
    if (provider) {
      provider.currentLatitude = telemetry.latitude;
      provider.currentLongitude = telemetry.longitude;
      provider.currentBearing = telemetry.bearing;
      provider.lastActiveAt = new Date().toISOString();
    }

    // If active on a specific request, broadcast directly to customer tracking screen
    if (telemetry.activeRequestId) {
      const room = `request:${telemetry.activeRequestId}`;
      this.server.to(room).emit(SocketServerEvents.PROVIDER_LOCATION_STREAM, telemetry);
    }
  }

  @SubscribeMessage(SocketClientEvents.SEND_CHAT_MESSAGE)
  handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: { requestId: string; senderId: string; senderName: string; senderRole: 'CUSTOMER' | 'PROVIDER'; text: string }
  ) {
    const room = `request:${msg.requestId}`;
    const message: ChatMessage = {
      id: `chat-${Date.now()}`,
      serviceRequestId: msg.requestId,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      messageText: msg.text,
      createdAt: new Date().toISOString(),
    };

    this.server.to(room).emit(SocketServerEvents.CHAT_MESSAGE_RECEIVED, message);
    return message;
  }
}
