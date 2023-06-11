import type { Server, Socket } from 'socket.io';
import { SngRoom } from './modules/sngRoom';
import * as Msg from "../../types/messages";

type gameData = {
  num: number;
};

export default function registerSngSocketEvents(socket: Socket, sngRoom: SngRoom) {
  // Initializing
  console.log("Adding socket listeners.");

  // const update_number = (socket: Socket, new_num: number) => {
  //   // 更新 server 端的數字
  //   data.num = data.num + new_num;
  
  //   console.log(data.num);
  
  //   // socket.emit(socketEvent.update_client_number, num); // emit to the sender
  //   // socket.broadcast.emit(socketEvent.update_client_number, num); // emit to all connected clients except the sender
  //   io.emit(socketEvent.update_client_number, data.num); // emit to all connected clients
  // };

  // socket.on(socketEvent.update_server_number, update_number(socket, 1));

  // // 各種註冊事件
  // // socket.on(下注等等的玩家操作資訊, room.playerReady)
  // socket.on(socketEvent.update_player_name, (data: { playerName: string }) => {
  //   // Access the playerName from the data received via the socket
  //   const { playerName } = data;

  //   // Call the updatePlayerName method on the gamingRoom instance with the playerName and socket as arguments
  //   gamingRoom.updatePlayerName(playerName, socket);

  //   // Other logic...
  // });

  // RICKTODO: 寫個 function 來處理各種事件
  // RICKTODO: socket.on('join_room', (data: { roomName: string }) => {

  socket.on("loadRoomInfoRequest", () => {
    console.log("loadRoomInfoRequest from " + socket.id);
    sngRoom.loadRoomInfo(socket);
  });

  socket.on("SignupRequest", (request: Msg.SignupRequest) => {
    console.log("SignupRequest from " + socket.id + ": " + JSON.stringify(request));
    sngRoom.signup(request, socket);
  });

  socket.on("disconnect", (reason) => {
    console.log("disconnect from " + socket.id + ": " + reason);
    sngRoom.disconnect(socket);
  });
};
