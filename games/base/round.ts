export abstract class Round {
  private readonly startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  // startTime
  getStartTime(): number {
    return this.startTime;
  }
};
