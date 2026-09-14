"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServerEvents = exports.SocketClientEvents = void 0;
var SocketClientEvents;
(function (SocketClientEvents) {
    SocketClientEvents["SUBSCRIBE_REQUEST"] = "subscribe:request";
    SocketClientEvents["UNSUBSCRIBE_REQUEST"] = "unsubscribe:request";
    SocketClientEvents["PROVIDER_LOCATION_UPDATE"] = "provider:location:update";
    SocketClientEvents["SEND_CHAT_MESSAGE"] = "chat:send_message";
})(SocketClientEvents || (exports.SocketClientEvents = SocketClientEvents = {}));
var SocketServerEvents;
(function (SocketServerEvents) {
    SocketServerEvents["REQUEST_UPDATED"] = "request:updated";
    SocketServerEvents["OFFER_RECEIVED"] = "offer:received";
    SocketServerEvents["OFFER_EXPIRED"] = "offer:expired";
    SocketServerEvents["OFFER_ACCEPTED"] = "offer:accepted";
    SocketServerEvents["PROVIDER_LOCATION_STREAM"] = "provider:location:stream";
    SocketServerEvents["CHAT_MESSAGE_RECEIVED"] = "chat:message_received";
})(SocketServerEvents || (exports.SocketServerEvents = SocketServerEvents = {}));
