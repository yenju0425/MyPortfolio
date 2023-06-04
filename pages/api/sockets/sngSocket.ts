import type { NextApiRequest } from 'next'
import type { NextApiResponseWithSocketIO } from '../../../types/socketServer' // custom response
import { SngRoom } from '../../../games/sng/modules/sngRoom';
import { Server } from "socket.io";
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
    io.on("connection", (socket) => {
      console.log(`Client: ${ socket.id } connect to the server. Adding socket listeners.`);
      // RICKTODO: 用 helper 來幫這個來自客戶端的 socket 註冊各種事件
      // registerSocketEvents(io, socket, game);
    });

    // Save socket.io server to res.socket.server.io
    res.socket.server.io = io;
  } else {
    console.log("Server already running.");
  }

  res.end();
};
