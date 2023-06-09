import type { Server } from 'socket.io';
import { RoomStatus } from './terms';
import * as Msg from "@/types/messages";

export abstract class Room {
  private readonly startTime: number;
  protected io: Server;
  protected currentStatus: RoomStatus; // displayed or used in the frontend

  constructor(io: Server) {
    this.startTime = Date.now();
    this.io = io;
    this.currentStatus = RoomStatus.NONE;
  }

  // startTime
  getStartTime(): number {
    return this.startTime;
  }

  // io
  getIo(): Server {
    return this.io;
  }

  // currentStatus, displayed in the frontend
  broadcastCurrentStatus(): void {
    const broadcast: Msg.RoomCurrentStatusUpdateBroadcast = {
      roomCurrentStatus: this.getStatus()
    };
    this.io.emit('RoomCurrentStatusUpdateBroadcast', broadcast);
  }

  getStatus(): RoomStatus {
    return this.currentStatus;
  }

  setStatus(status: RoomStatus): void {
    this.currentStatus = status;
    this.broadcastCurrentStatus();
  }

  // utility functions
  play(): void {
    this.setStatus(RoomStatus.PLAYING);
  }

  reset(): void {
    this.setStatus(RoomStatus.NONE);
  }
}
