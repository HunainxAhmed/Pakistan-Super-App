export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}
export interface DriverTelemetry {
    providerId: string;
    latitude: number;
    longitude: number;
    bearing: number;
    speedKmh: number;
    timestamp: number;
    activeRequestId?: string;
}
export declare enum SocketClientEvents {
    SUBSCRIBE_REQUEST = "subscribe:request",
    UNSUBSCRIBE_REQUEST = "unsubscribe:request",
    PROVIDER_LOCATION_UPDATE = "provider:location:update",
    SEND_CHAT_MESSAGE = "chat:send_message"
}
export declare enum SocketServerEvents {
    REQUEST_UPDATED = "request:updated",
    OFFER_RECEIVED = "offer:received",
    OFFER_EXPIRED = "offer:expired",
    OFFER_ACCEPTED = "offer:accepted",
    PROVIDER_LOCATION_STREAM = "provider:location:stream",
    CHAT_MESSAGE_RECEIVED = "chat:message_received"
}
export interface ChatMessage {
    id: string;
    serviceRequestId: string;
    senderId: string;
    senderName: string;
    senderRole: 'CUSTOMER' | 'PROVIDER' | 'SUPPORT';
    messageText: string;
    createdAt: string;
}
