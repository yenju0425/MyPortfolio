import { RoomStatus } from './terms';
import type { Server, Socket } from 'socket.io';

export abstract class Room {
  private readonly startTime: number;
  protected io: Server;
  protected currentStatus: RoomStatus;

  constructor(io: Server) {
    this.startTime = Date.now();
    this.io = io;
    this.currentStatus = RoomStatus.NONE;
  }

  getStatus(): RoomStatus {
    return this.currentStatus;
  }

  play(): void {
    this.currentStatus = RoomStatus.PLAYING;
  }

  reset(): void {
    this.currentStatus = RoomStatus.NONE;
  }

  getStartTime(): number {
    return this.startTime;
  }
}
