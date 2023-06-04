import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocketIO } from '../../../types/socketServer' // custom response
import { SngRoom } from '../../../games/sng/modules/sngRoom';
import { Server } from "socket.io";
import { ServerEvents, ClientEvents } from "../../../games/sng/events";
import registerSocketEvents from '../../../games/sng/socketHandler';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocketIO
) {
  if (!res.socket.server.io) {
    console.log("First connection. Setting up the server.");

    // Creating socket.io server
    const io = new Server(res.socket.server);

    // Init game data
    const sngRoom = new SngRoom();

    // Add event listeners to client when client connects
    io.on(ClientEvents.connect, (socket) => {
      console.log(socket.id + " connected.");

      // register all socket events
      registerSocketEvents(io, socket, sngRoom);

      // load sng room
      socket.emit(ServerEvents.update_sng_room, sngRoom);
    });

    // Save socket.io server to res.socket.server.io
    res.socket.server.io = io;
  } else {
    console.log("Server already running.");
  }

  res.end();
};
