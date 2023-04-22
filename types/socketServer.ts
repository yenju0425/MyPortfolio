import type { Server as SocketIO } from 'socket.io';
import type { Server } from 'http';
import type { Socket } from 'net'
import type { NextApiResponse } from 'next'

// res.socket.server.io
interface ServerWithSocketIO extends Server {
  io: SocketIO;
}

interface SocketWithSocketIO extends Socket {
  server: ServerWithSocketIO;
}

export interface NextApiResponseWithSocketIO extends NextApiResponse {
  socket: SocketWithSocketIO;
}
