import { io, Socket } from "socket.io-client";
import { getRestaurantId } from "../utils/restaurantId";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? (import.meta.env.VITE_API_URL as string).replace(/\/api\/?$/, "")
    : "");

const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  query: { restaurantId: getRestaurantId() },
});

export function connectSocket(): void {
  // Update query with latest restaurantId before connecting
  // (in case it was resolved after socket instantiation)
  const id = getRestaurantId();
  if (id) {
    (socket.io.opts.query as Record<string, string>).restaurantId = id;
  }
  if (!socket.connected) socket.connect();
}

export function disconnectSocket(): void {
  if (socket.connected) socket.disconnect();
}

export default socket;
