import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/config';

type SocketEventMap = {
  'expense:created': { groupId: string; expenseId: string };
  'expense:updated': { groupId: string; expenseId: string };
  'expense:deleted': { groupId: string; expenseId: string };
  'payment:recorded': { groupId: string | null; paymentId: string };
  'balance:updated': { groupId: string };
  'member:joined': { groupId: string; userId: string };
  'member:left': { groupId: string; userId: string };
  'comment:added': { expenseId: string; commentId: string };
};

type SocketEventName = keyof SocketEventMap;

let socket: Socket | null = null;

export function initSocket(accessToken: string): Socket {
  if (socket?.connected) return socket;

  socket = io(Config.socketUrl, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function onSocketEvent<E extends SocketEventName>(
  event: E,
  handler: (data: SocketEventMap[E]) => void,
): () => void {
  socket?.on(event as string, handler as (...args: unknown[]) => void);
  return () => {
    socket?.off(event as string, handler as (...args: unknown[]) => void);
  };
}

export function joinRoom(room: string): void {
  socket?.emit('join', room);
}

export function leaveRoom(room: string): void {
  socket?.emit('leave', room);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
