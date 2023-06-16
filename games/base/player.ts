import { PlayerStatus } from './terms';
import { Server, Socket } from 'socket.io';
import * as Msg from "../../types/messages"; // RICKTODO: 拆分出去，基本會用的 proto (base.message 之類的)

export abstract class Player {
  private readonly id: number;
  private readonly name: string; // displayed in the frontend
  private readonly email: string;
  protected socket: Socket;
  protected io: Server;
  protected currentStatus: PlayerStatus; // displayed in the frontend

  constructor(id: number, name: string, email: string, socket: Socket, io: Server) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.socket = socket;
    this.io = io;
    this.currentStatus = PlayerStatus.NONE;
  }

  // id
  getId(): number {
    return this.id;
  }

  // name
  getName(): string {
    return this.name;
  }

  // email
  getEmail(): string {
    return this.email;
  }

  // socket
  getSocket(): Socket {
    return this.socket;
  }

  // io
  getIo(): Server {
    return this.io;
  }

  // currentStatus, displayed in the frontend
  broadcastCurrentStatus(): void {
    const broadcast: Msg.PlayerCurrentStatusUpdateBroadcast = {
      seatId: this.getId(),
      playerCurrentStatus: this.getStatus()
    };
    this.io.emit('PlayerCurrentStatusUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentStatus: " + JSON.stringify(broadcast));
  }

  getStatus(): PlayerStatus {
    return this.currentStatus;
  }

  setStatus(status: PlayerStatus): void {
    this.currentStatus = status;
    this.broadcastCurrentStatus();
  }

  // utility functions
  ready(): void {
    this.setStatus(PlayerStatus.READY);
  }

  unready(): void {
    this.setStatus(PlayerStatus.NONE);
  }

  play(): void {
    this.setStatus(PlayerStatus.PLAYING);
  }

  reset(): void {
    this.setStatus(PlayerStatus.NONE);
  }

  eliminate(): void {
    this.setStatus(PlayerStatus.ELIMINATED);
  }

  quit(): void {
    this.setStatus(PlayerStatus.QUIT);
  }
};
