import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocketIO } from '@/types/socketServer'
import { Server } from "socket.io";
import { SngRoom } from '@/games/sng/modules/sngRoom';
import registerSngSocketEvents from '@/games/sng/socketHandler';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocketIO
) {
  if (!res.socket.server.io) {
    console.log("First connection, starting socket.io server.");

    const io = new Server(res.socket.server);
    const sngRoom = new SngRoom(io);

    // Add event listeners to client when client connects.
    io.on("connection", (socket) => {
      console.log(socket.id + " connected.");

      // Join the spectators group by default.
      socket.join("spectators");

      // Register all events.
      registerSngSocketEvents(socket, sngRoom);
    });

    // Save socket.io server to `res.socket.server.io`.
    res.socket.server.io = io;
  } else {
    console.log("Server already running.");
  }

  res.end();
};
