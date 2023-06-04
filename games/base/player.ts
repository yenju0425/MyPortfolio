import { PlayerStatus } from './terms';
import { Socket } from 'socket.io';

export abstract class Player {
  private readonly id: number;
  private readonly name: string;
  private readonly email: string;
  protected socket: Socket;
  protected currentStatus: PlayerStatus;

  constructor(id: number, name: string, email: string, socket: Socket) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.socket = socket;
    this.currentStatus = PlayerStatus.NONE;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getSocket(): Socket {
    return this.socket;
  }

  getStatus(): PlayerStatus {
    return this.currentStatus;
  }

  ready(): void {
    this.currentStatus = PlayerStatus.READY;
  }

  unready(): void {
    this.currentStatus = PlayerStatus.NONE;
  }

  play(): void {
    this.currentStatus = PlayerStatus.PLAYING;
  }

  reset(): void {
    this.currentStatus = PlayerStatus.NONE;
  }

  eliminate(): void {
    this.currentStatus = PlayerStatus.ELIMINATED;
  }

  quit(): void {
    this.currentStatus = PlayerStatus.QUIT;
  }
};
