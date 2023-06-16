import { Server, Socket } from 'socket.io';
import { SngPlayer } from "./sngPlayer";
import { Room } from "../../base/room";
import { configs } from "./configs";
import { Card, Deck } from './deck';
import { RoomStatus } from '../../base/terms';
import { PlayerStatus } from '../../base/terms';
import { SngRound } from "./sngRound";
import { get } from "http";
import { Streets } from './terms';
import { Pot } from './pots';
import { Round } from '../../base/round';

import * as Msg from "../../../types/messages";

export class SngRoom extends Room {
  private readonly numPlayers: number;
  private readonly playerActionTime: number;
  private readonly initChips: number;
  private readonly blindStructure: { bigBlind: number, ante: number, duration: number }[];
  private totalNumSngs: number;
  private totalNumRounds: number;
  private players: (SngPlayer | null)[];
  private currentSngStartTime: number | null;
  private currentNumSngRounds: number;
  private currentBigBlindSeatId: number | null;
  private currentBlindLevel: number;
  private lastBlindUpdateTime: number | null;
  private currentBlindUpdateTimer: NodeJS.Timeout | undefined;
  private currentRound: SngRound | null;
  private currentPlayerId: number | null; // an index of players

  constructor(io: Server) {
    super(io);
    this.numPlayers = configs.numPlayers;
    this.playerActionTime = configs.playerActionTime;
    this.initChips = configs.initChips;
    this.blindStructure = configs.blindStructure;
    this.totalNumSngs = 0;
    this.totalNumRounds = 0;
    this.players = new Array<SngPlayer | null>(this.numPlayers).fill(null);
    this.currentSngStartTime = null;
    this.currentNumSngRounds = 0;
    this.currentBigBlindSeatId = null;
    this.currentBlindLevel = 0;
    this.lastBlindUpdateTime = null;
    this.currentBlindUpdateTimer = undefined;
    this.currentRound = null;
    this.currentPlayerId = null;
  };

  // utility functions
  isAllPlayersReady(): boolean {
    return this.getNumOfPlayers() >= 2 && this.players.filter(player => player !== null).every(player => player?.getStatus() === PlayerStatus.READY);
  };

  roundElimination(): void {
    this.players.forEach(player => {
      if (!player?.getCurrentChips()) {
        player?.eliminate();
      }
    });
  };

  getNumOfPlayersStillInSng(): number {
    return this.players.filter(player => player?.isStillInSng()).length;
  };

  getNumOfPlayers(): number {
    return this.players.filter(player => player !== null).length;
  };

  // totalNumSngs
  updateTotalNumSngs(): void {
    this.totalNumSngs++;
  };

  getTotalNumSngs(): number {
    return this.totalNumSngs;
  };

  // totalNumRounds
  udateTotalNumRounds(): void {
    this.totalNumRounds++;
  };

  getTotalNumRounds(): number {
    return this.totalNumRounds;
  };

  // players
  initSngPlayers(): void {
    this.players.forEach(player => player?.startSng(this.initChips));
  };

  resetPlayers(): void {
    this.players = new Array<SngPlayer | null>(this.numPlayers).fill(null);
  };

  setPlayer(id: number, player: SngPlayer): void {
    this.players[id] = player;

    // broadcast signup
    const broadcast: Msg.SignupBroadcast = {
      id: id,
      name: player.getName(),
    };
    this.io.emit("SignupBroadcast", broadcast);
  
    // send signup response
    const response: Msg.SignupResponse = {
      id: id,
    };
    player.getSocket().emit("SignupResponse", response);
  };

  resetPlayer(id: number): void { //TODO: might need to do some safety check
    this.players[id] = null;
  };

  getPlayer(socket: Socket): SngPlayer | null {
    return this.players.find(player => player?.getSocket() === socket) || null;
  };

  getPlayerId(socket: Socket): number { // If the client is not a player, return -1.
    return this.players.findIndex(player => player?.getSocket() === socket);
  };

  getPlayersName(): string[] {
    return this.players.map(player => player ? player.getName() : '');
  };

  getPlayersCurrentChip(): number[] {
    return this.players.map(player => player ? player.getCurrentChips() : 0);
  };

  getPlayersCurrentBetSize(): number[] {
    return this.players.map(player => player ? player.getCurrentBetSize() : 0);
  };

  getPlayersStatus(): (PlayerStatus | null)[] {
    // return this.players.map(player => player?.getStatus() || null); <- The `||` returns the first operand if it is truthy and the second operand otherwise.
    return this.players.map(player => player ? player.getStatus() : null); // Since the status of a player can be `0`, we cannot use `||` here.
  };

  // currentBigBlindSeatId
  getNextBigBlindSeatId(): number {
    if (!this.currentBigBlindSeatId) {
      const nonNullIds = this.players.map((player, id) => player !== null ? id : -1).filter(id => id !== -1);
      return nonNullIds[Math.floor(Math.random() * nonNullIds.length)];
    } else {
      let nextBmallBlind = (this.currentBigBlindSeatId + 1) % this.numPlayers;
      while (this.players[nextBmallBlind] === null) {
        nextBmallBlind = (nextBmallBlind + 1) % this.numPlayers;
      }
      return nextBmallBlind;
    }
  }

  updateCurrentBigBlindSeatId(): void {
    this.currentBigBlindSeatId = this.getNextBigBlindSeatId();
  };

  resetCurrentBigBlindSeatId(): void {
    this.currentBigBlindSeatId = null;
  };

  getCurrentBigBlindSeatId(): number {
    if (this.currentBigBlindSeatId === null) {
      console.log("currentBigBlindSeatId is null, update it automatically.");
      this.updateCurrentBigBlindSeatId();
      return this.getCurrentBigBlindSeatId();
    } else {
      return this.currentBigBlindSeatId;
    }
  }

  // currentRound
  initCurrentRound(): void {
    this.currentRound = new SngRound(this.endRound, this.players, this.getCurrentBigBlindSeatId(), this.getCurrentBigBlind());
    this.currentRound.getDeck().shuffle(); // The deck needs to be shuffled after it is created.
  };

  getCurrentRound(): SngRound {
    if (!this.currentRound) {
      console.log("currentRound is null, please init it first.");
      this.initCurrentRound();
      return this.getCurrentRound();
    } else {
      return this.currentRound;
    }
  }

  // currentBlindLevel
  updateCurrentBlindLevel(): void {
    this.currentBlindLevel++;
    this.lastBlindUpdateTime = Date.now();

    console.log("Current big blind: " + this.getCurrentBigBlind());
  };

  resetCurrentBlindLevel(): void {
    this.currentBlindLevel = 0;
    this.lastBlindUpdateTime = null;
  };

  getCurrentBigBlind(): number {
    if (this.currentBlindLevel === 0) {
      console.log("currentBlindLevel is 0, update it automatically.");
      this.updateCurrentBlindLevel();
    }
    return this.blindStructure[this.currentBlindLevel].bigBlind;
  };

  startBlindUp(): void {
    this.updateCurrentBlindLevel();
    this.setBlinUpTimer();
  };

  endBlindUp(): void {
    clearTimeout(this.currentBlindUpdateTimer);
    this.resetCurrentBlindLevel();
  };

  setBlinUpTimer(): void {
    const blindLevelTime = this.blindStructure[this.currentBlindLevel]?.duration * 60 * 1000;
    if (!blindLevelTime) {
      return;
    }
    this.currentBlindUpdateTimer = setTimeout(() => {
      this.updateCurrentBlindLevel();
      this.setBlinUpTimer();
    }, blindLevelTime);
  };

  // client actions
  loadRoomInfo(socket: Socket): void {
    const response: Msg.LoadRoomInfoResponse = {
      clientSeatId: this.getPlayerId(socket),
      roomCurrentStatus: this.getStatus(),
      playersNames: this.getPlayersName(),
      playersCurrentChips: this.getPlayersCurrentChip(),
      playersCurrentBetSizes: this.getPlayersCurrentBetSize(),
      playersCurrentStatuses: this.getPlayersStatus(),
    };
    socket.emit("LoadRoomInfoResponse", response);
  };

  disconnect(socket: Socket): void {
    const player = this.getPlayer(socket);

    if (player === null) {
      console.log("Specator disconnected. socket.id: " + socket.id);
      return;
    }

    if (this.currentStatus === RoomStatus.NONE) {
      this.cancelSignUp(socket);
    } else if (this.currentStatus === RoomStatus.PLAYING) {
      this.playerQuit(socket);
    } else {
      console.error("Unexpected room status: " + this.currentStatus);
      // TODO: Shut down the room...
    }
  }

  signup(request: Msg.SignupRequest, socket: Socket): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      console.log(socket.id + " signup failed: Cannot signup when the game is started.");
      return;
    }

    if (this.players[request.id] !== null) {
      console.log(socket.id + " signup failed: The seat is occupied.");
      return;
    }

    const player = new SngPlayer(request.id, request.name, request.email, socket, this.io);
    this.setPlayer(request.id, player);

    // Signup success.
    console.log(socket.id + " signup success.");

    // Swith the socket to the `players` room
    socket.leave("spectators");
    socket.join("players");
  };

  cancelSignUp(socket: Socket): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      // Response to client, "The game is started, you cannot cancel sign up"
      return;
    }

    const id = this.getPlayerId(socket);
    if (id === -1) {
      // Response to client, "failed"
      return;
    }

    this.resetPlayer(id);

    const broadcast: Msg.StandupBroadcast = {
      seatId: id,
    };
    this.io.emit("StandupBroadcast", broadcast);
  };

  ready(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.NONE) {
      console.log(socket.id + " ready failed: The game is started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null) {
      console.log(socket.id + " ready failed: Not signed up.");
      return;
    }

    player.ready();

    // Ready success.
    const clientSeatId = this.getPlayerId(socket);
    console.log(socket.id + " is ready.");

    const response: Msg.ReadyResponse = {
      id: clientSeatId
    };
    socket.emit("ReadyResponse", response);

    // check if all players are ready
    if (this.isAllPlayersReady()) {
      this.startSng();
    }
  }

  unready(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.NONE) {
      // Response to client, "failed"
      return;
    }

    // if the seat is empty, the player cannot unready
    const player = this.getPlayer(socket);

    if (player === null) {
      // Response to client, "failed"
      return;
    }

    player.unready();
  };

  playerBet(socket: Socket, amount: number): void {
    const player = this.getPlayer(socket);

    if (player === null) {
      // Response to client, "failed"
      return;
    }

    // TODO: check if the amount is valid, if tht action is valid
    console.log('playerBet', amount);

    // place bet
    player.placeBet(amount);
    player.act();

    // update round info
    this.getCurrentRound().updateCurrentBetSize(amount);
  };

  //playerCall(index: number): void {

  //playerCheck(index: number): void {

  //playerRaise(index: number, amount: number): void {

  //playerAllIn(index: number): void {

  playerQuit(socket: Socket): void {
    if (this.currentStatus === RoomStatus.NONE) {
      // Response to client, "The game is not started, you cannot quit"
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null) {
      // Response to client, "failed"
      return;
    }

    player.quit();
  };

  // room functions
  startSng(): void {
    console.log("[RICKDEBUG] startSng");

    // Set the current status to PLAYING.
    this.play(); // [RICKTODO]: 通知前端

    // Update the total number of SNGs.
    this.updateTotalNumSngs();

    // Initialize players in the SNG.
    this.initSngPlayers();

    // Initialize the start time of the current SNG.
    this.currentSngStartTime = Date.now();

    // Initialize the number of rounds of the current SNG.
    this.currentNumSngRounds = 0;

    // Initialize the current blind level, and set the timeout for updating the blind level
    this.startBlindUp();

    // Start the first round
    this.startRound();
  };

  startRound(): void {
    console.log("[RICKDEBUG] startRound");

    // Update totalNumRounds.
    this.udateTotalNumRounds();

    // Update current bmallBlind id.
    this.updateCurrentBigBlindSeatId();

    // Create a new round.
    this.initCurrentRound();

    // Initialize players in the round.
    this.getCurrentRound().initRoundPlayers();

    // Start the first street.
    this.getCurrentRound().startStreet();
  };

  endRound(): void {
    // Reset current round.
    this.currentRound = null;

    // Eliminate players who have no chips.
    this.roundElimination();
    
    // Check if the SNG is ended.
    if (this.getNumOfPlayersStillInSng() < 2) {
      this.endSng();
    } else {
      this.startRound();
    }
  }  

  endSng(): void {
    // RICKTODO: Send email to the players
    // this.sendSngResult();

    // Reset players.
    this.resetPlayers();

    // Reset the start time of the current SNG.
    this.currentSngStartTime = null;

    // Reset the number of rounds of the current SNG.
    this.currentNumSngRounds = 0;
  
    // Reset the current bmallBlind.
    this.resetCurrentBigBlindSeatId();

    // Reset the currentBlindLevel, lastBlindUpdateTime, and clear thte timer.
    this.endBlindUp();

    // Set currentStatus to NONE.
    this.reset();

    // RICKTODO: 通知前端
  }
}
