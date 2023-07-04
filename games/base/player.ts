import type { Server, Socket } from 'socket.io';
import { PlayerStatus } from './terms';
import * as Msg from "@/types/messages";

export abstract class Player {
  private readonly seatId: number;
  private readonly name: string; // displayed or used in the frontend
  private readonly email: string;
  protected socket: Socket;
  protected io: Server;
  protected currentStatus: PlayerStatus; // displayed or used in the frontend

  constructor(seatId: number, name: string, email: string, socket: Socket, io: Server) {
    this.seatId = seatId;
    this.name = name;
    this.email = email;
    this.socket = socket;
    this.io = io;
    this.currentStatus = PlayerStatus.NONE;
  }

  // seatId
  getSeatId(): number {
    return this.seatId;
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
      seatId: this.getSeatId(),
      playerCurrentStatus: this.getCurrentStatus()
    };
    this.io.emit('PlayerCurrentStatusUpdateBroadcast', broadcast);
  }

  getCurrentStatus(): PlayerStatus {
    return this.currentStatus;
  }

  setCurrentStatus(status: PlayerStatus): void {
    this.currentStatus = status;
    this.broadcastCurrentStatus();
  }

  // utility functions
  ready(): void {
    this.setCurrentStatus(PlayerStatus.READY);
  }

  unready(): void {
    this.setCurrentStatus(PlayerStatus.NONE);
  }

  play(): void {
    this.setCurrentStatus(PlayerStatus.PLAYING);
  }

  reset(): void {
    this.setCurrentStatus(PlayerStatus.NONE);
  }

  eliminate(): void {
    this.setCurrentStatus(PlayerStatus.ELIMINATED);
  }

  quit(): void {
    this.setCurrentStatus(PlayerStatus.QUIT);
  }
};
