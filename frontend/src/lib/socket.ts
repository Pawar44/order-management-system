import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}