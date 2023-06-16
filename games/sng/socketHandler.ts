import type { Server, Socket } from 'socket.io';
import { SngRoom } from './modules/sngRoom';
import * as Msg from "../../types/messages";

type gameData = {
  num: number;
};

export default function registerSngSocketEvents(socket: Socket, sngRoom: SngRoom) {
  console.log("Adding socket listeners.");

  socket.on("disconnect", (reason) => {
    console.log("socket: " + socket.id + " disconnected. Reason: " + reason + ".");
    sngRoom.disconnect(socket);
  });

  socket.on("LoadRoomInfoRequest", () => {
    console.log("socket: " + socket.id + " LoadRoomInfoRequest.");
    sngRoom.loadRoomInfo(socket);
  });

  socket.on("SignupRequest", (request: Msg.SignupRequest) => {
    console.log("socket: " + socket.id + " SignupRequest: " + JSON.stringify(request));
    sngRoom.signup(request, socket);
  });

  socket.on("ReadyRequest", () => {
    console.log("socket: " + socket.id + " ReadyRequest.");
    sngRoom.ready(socket);
  });
};
