import type { Socket } from 'socket.io';
import type { SngRoom } from './modules/sngRoom';
import * as Msg from "@/types/messages";

export default function registerSngSocketEvents(socket: Socket, sngRoom: SngRoom) {
  console.log("Adding socket listeners.");

  socket.on("disconnect", (reason) => {
    console.log("socket: " + socket.id + " disconnected. Reason: " + reason + ".");
    sngRoom.clientDisconnect(socket);
  });

  socket.on("LoadRoomInfoRequest", () => {
    console.log("socket: " + socket.id + " LoadRoomInfoRequest.");
    sngRoom.clientLoadRoomInfo(socket);
  });

  socket.on("SignupRequest", (request: Msg.SignupRequest) => {
    console.log("socket: " + socket.id + " SignupRequest: " + JSON.stringify(request));
    sngRoom.clientSignup(request, socket);
  });

  socket.on("ReadyRequest", () => {
    console.log("socket: " + socket.id + " ReadyRequest.");
    sngRoom.playerReady(socket);
  });

  socket.on("FoldRequest", () => {
    console.log("socket: " + socket.id + " FoldRequest.");
    sngRoom.playerFold(socket);
  });

  socket.on("CheckRequest", () => {
    console.log("socket: " + socket.id + " CheckRequest.");
    sngRoom.playerCheck(socket);
  });

  socket.on("CallRequest", () => {
    console.log("socket: " + socket.id + " CallRequest.");
    sngRoom.playerCall(socket);
  });

  socket.on("BetRequest", (request: Msg.BetRequest) => {
    console.log("socket: " + socket.id + " BetRequest: " + JSON.stringify(request));
    //sngRoom.playerBet(request, socket);
  });

  socket.on("RaiseRequest", (request: Msg.RaiseRequest) => {
    console.log("socket: " + socket.id + " RaiseRequest: " + JSON.stringify(request));
    //sngRoom.playerRaise(request, socket);
  });

  socket.on("AllInRequest", () => {
    console.log("socket: " + socket.id + " AllInRequest.");
    //sngRoom.playerAllIn(socket);
  });
};
