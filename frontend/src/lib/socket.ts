import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}