// // Q: 什麼是一個 server?
// // A: server 說穿了就是運作在 “不是” client 的設備上的程式
// // Q: 那程式又是什麼?
// // A: 程式就是描述抽象邏輯的語言
// //
// // server.ts 會定義所有關於這個遊戲的邏輯，簡單來說就是能夠處理來自 client 端的各種請求
// // client 端的各種請求，其實就只是用呼叫 server 做對應的動作
// // client 在請求 server 做對應的動作的同時，會用 Socket 的方式傳遞資料

import type { Server, Socket } from 'socket.io';
import { socketEvent } from './events';

type gameData = {
  num: number;
};

export default function registerSocketEvents(io: Server, socket: Socket, data: gameData) {
  // Initializing
  console.log("Adding socket listeners.");

  const update_number = (new_num: number) => {
    // 更新 server 端的數字
    data.num = data.num + new_num;
  
    console.log(data.num);
  
    // socket.emit(socketEvent.update_client_number, num); // emit to the sender
    // socket.broadcast.emit(socketEvent.update_client_number, num); // emit to all connected clients except the sender
    io.emit(socketEvent.update_client_number, data.num); // emit to all connected clients
  };

  socket.on(socketEvent.update_server_number, update_number);
};