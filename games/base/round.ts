import type { Server } from 'socket.io';

export abstract class Round {
  private readonly startTime: number;
  protected io: Server;

  constructor(io: Server) {
    this.startTime = Date.now();
    this.io = io;
  }

  // startTime
  getStartTime(): number {
    return this.startTime;
  }

  // io
  getIo(): Server {
    return this.io;
  }
};
