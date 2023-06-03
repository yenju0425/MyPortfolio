import { SngPlayer } from "./sngPlayer";
import { Room } from "../../base/room";
import { configs } from "./configs";
import { Card, Deck } from './deck';
import { RoomStatus } from '../../base/terms';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../../base/terms';
import { SngRound } from "./sngRound";
import { get } from "http";
import { Streets } from './terms';
import { Pot } from './pots';
import { Round } from '../../base/round';

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
  private currentDealerId: number | null; // an index of players
  private currentBlindLevel: number;
  private lastBlindUpdateTime: number | null;
  private currentBlindUpdateTimer: NodeJS.Timeout | undefined;
  private currentRound: SngRound | null;
  private currentPlayerId: number | null; // an index of players

  constructor() {
    super();
    this.numPlayers = configs.numPlayers;
    this.playerActionTime = configs.playerActionTime;
    this.initChips = configs.initChips;
    this.blindStructure = configs.blindStructure;
    this.totalNumSngs = 0;
    this.totalNumRounds = 0;
    this.players = new Array<SngPlayer | null>(this.numPlayers).fill(null);
    this.currentSngStartTime = null;
    this.currentNumSngRounds = 0;
    this.currentDealerId = null;
    this.currentBlindLevel = 0;
    this.lastBlindUpdateTime = null;
    this.currentBlindUpdateTimer = undefined;
    this.currentRound = null;
    this.currentPlayerId = null;
  }

  // utility functions
  isAllPlayersReady(): boolean {
    return this.players.filter(player => player !== null).every(player => player?.getStatus() === PlayerStatus.READY);
  }

  roundElimination(): void {
    this.players.forEach(player => {
      if (!player?.getCurrentChips()) {
        player?.eliminate();
      }
    });
  }

  getNumOfPlayersStillInSng(): number {
    return this.players.filter(player => player?.isStillInSng()).length;
  }

  // totalNumSngs
  updateTotalNumSngs(): void {
    this.totalNumSngs++;
  }

  getTotalNumSngs(): number {
    return this.totalNumSngs;
  }

  // totalNumRounds
  udateTotalNumRounds(): void {
    this.totalNumRounds++;
  }

  getTotalNumRounds(): number {
    return this.totalNumRounds;
  }

  // players
  initSngPlayers(): void {
    this.players.forEach(player => player?.startSng(this.initChips));
  }

  resetPlayers(): void {
    this.players = new Array<SngPlayer | null>(this.numPlayers).fill(null);
  }

  setPlayer(player: SngPlayer, seatid: number): void {
    this.players[seatid] = player;
  }

  resetPlayer(seatid: number): void { //TODO: might need to do some safety check
    this.players[seatid] = null;
  }

  getPlayer(socket: Socket): SngPlayer | null {
    return this.players.find(player => player?.getSocket() === socket) || null;
  }

  getPlayerSeatid(socket: Socket): number {
    return this.players.findIndex(player => player?.getSocket() === socket);
  }

  // currentDealerId
  getNextDealerId(): number {
    if (!this.currentDealerId) {
      const nonNullSeatids = this.players.map((player, seatid) => player !== null ? seatid : -1).filter(seatid => seatid !== -1);
      return nonNullSeatids[Math.floor(Math.random() * nonNullSeatids.length)];
    } else {
      let nextDealer = (this.currentDealerId + 1) % this.numPlayers;
      while (this.players[nextDealer] === null) {
        nextDealer = (nextDealer + 1) % this.numPlayers;
      }
      return nextDealer;
    }
  }

  updateCurrentDealerId(): void {
    this.currentDealerId = this.getNextDealerId();
  }

  resetCurrentDealerId(): void {
    this.currentDealerId = null;
  }

  getCurrentDealerId(): number {
    if (this.currentDealerId === null) {
      console.log("currentDealerId is null, update it automatically.");
      this.updateCurrentDealerId();
      return this.getCurrentDealerId();
    } else {
      return this.currentDealerId;
    }
  }

  // currentRound
  initCurrentRound(): void {
    this.currentRound = new SngRound(this.endRound, this.players, this.getCurrentDealerId(), this.getCurrentBigBlind());
  }

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
  }

  resetCurrentBlindLevel(): void {
    this.currentBlindLevel = 0;
    this.lastBlindUpdateTime = null;
  }

  getCurrentBigBlind(): number {
    if (this.currentBlindLevel === 0) {
      console.log("currentBlindLevel is 0, update it automatically.");
      this.updateCurrentBlindLevel();
    }
    return this.blindStructure[this.currentBlindLevel].bigBlind;
  }

  startBlindUp(): void {
    this.updateCurrentBlindLevel();
    this.setBlinUpTimer();
  }

  endBlindUp(): void {
    clearTimeout(this.currentBlindUpdateTimer);
    this.resetCurrentBlindLevel();
  }

  setBlinUpTimer(): void {
    const blindLevelTime = this.blindStructure[this.currentBlindLevel]?.duration * 60 * 1000;
    if (!blindLevelTime) {
      return;
    }
    this.currentBlindUpdateTimer = setTimeout(() => {
      this.updateCurrentBlindLevel();
      this.setBlinUpTimer();
    }, blindLevelTime);
  }



  // player functions
  playerSignUp(email: string, name: string, seatid: number, socket: Socket): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      // Response to client, "The game is started, you cannot sign up"
      return;
    }

    if (this.players[seatid] !== null) {
      // Response to client, "The seat is occupied, you cannot sign up"
      return;
    }

    const player = new SngPlayer(email, name, socket);
    this.setPlayer(player, seatid);

    // Response to client, "success"
  }

  playerCancelSignUp(socket: Socket): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      // Response to client, "The game is started, you cannot cancel sign up"
      return;
    }

    const seatid = this.getPlayerSeatid(socket);
    if (seatid === -1) {
      // Response to client, "failed"
      return;
    }

    this.resetPlayer(seatid);

    // Response to client, "success"
  }

  playerReady(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.NONE) {
      // Response to client, "failed"
      return;
    }

    // if the seat is empty, the player cannot ready
    const player = this.getPlayer(socket);

    if (player === null) {
      // Response to client, "failed"
      return;
    }

    player.ready();

    // check if all players are ready
    if (this.isAllPlayersReady()) {
      this.startSng();
    }
  }

  playerUnready(socket: Socket): void {
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
  }

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
  }

  playerDisconnect(socket: Socket): void { // TODO: 要確定是 Player 才送來，一般觀眾不會送來
    const player = this.getPlayer(socket);

    if (player === null) {
      // Response to client, "failed"
      return;
    }

    if (this.currentStatus === RoomStatus.NONE) { //perform playerCancelSignUp
      this.playerCancelSignUp(socket);
    } else if (this.currentStatus === RoomStatus.PLAYING) { //perform playerQuit
      this.playerQuit(socket);
    } else {
      console.log('unknown status');
      // TODO: Shut down the room...
    }
  }

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
  }

  //playerCall(index: number): void {

  //playerCheck(index: number): void {

  //playerRaise(index: number, amount: number): void {

  //playerAllIn(index: number): void {

  // room functions
  startSng(): void {
    // Set the current status to PLAYING.
    this.play();

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
  }

  startRound(): void {
    // Update totalNumRounds.
    this.udateTotalNumRounds();

    // Update current dealer id.
    this.updateCurrentDealerId();

    // Create a new round.
    this.initCurrentRound();

    // Initialize players in the round.
    this.getCurrentRound().initRoundPlayers();

    // Start the first street.
    this.getCurrentRound().startStreet();
  }

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
  
    // Reset the current dealer.
    this.resetCurrentDealerId();

    // Reset the currentBlindLevel, lastBlindUpdateTime, and clear thte timer.
    this.endBlindUp();

    // Set currentStatus to NONE.
    this.reset();

    // RICKTODO: 通知前端
  }
}
