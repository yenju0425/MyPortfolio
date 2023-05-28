import { RoomStatus } from './terms';

export abstract class Room {
  private readonly startTime: number;
  protected currentStatus: RoomStatus;

  constructor() {
    this.startTime = Date.now();
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
