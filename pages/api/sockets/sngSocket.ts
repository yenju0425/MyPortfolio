import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocketIO } from '../../../types/socketServer' // custom response
// import { Game } from '../../../poker/poker'
import { Server } from "socket.io";
import registerSocketEvents from '../../../games/socketHandler'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocketIO
) {
  if (!res.socket.server.io) {
    console.log("First connection. Setting up the server.");

    // Creating socket.io server
    const io = new Server(res.socket.server);

    // Init game data
    // let game = new Game();

    // Add event listeners to client when client connects
    io.on("connection", (socket) => {
      console.log(`Client: ${ socket.id } connect to the server. Adding socket listeners.`);
      // registerSocketEvents(io, socket, game);
    });

    // Save socket.io server to res.socket.server.io
    res.socket.server.io = io;
  } else {
    console.log("Server already running.");
  }

  res.end();
};
