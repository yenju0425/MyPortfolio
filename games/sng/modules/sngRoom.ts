import type { Server, Socket } from 'socket.io';
import { Room } from "@/games/base/room";
import { RoomStatus, PlayerStatus } from '@/games/base/terms';
import { Card } from './deck';
import { configs } from "./configs";
import { SngRound } from "./sngRound";
import { SngPlayer } from "./sngPlayer";
import * as Msg from "@/types/messages";

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
  };

  // totalNumSngs
  getTotalNumSngs(): number {
    return this.totalNumSngs;
  };

  setTotalNumSngs(num: number): void {
    this.totalNumSngs = num;
  };

  updateTotalNumSngs(): void {
    this.setTotalNumSngs(this.getTotalNumSngs() + 1);
  };

  // totalNumRounds
  getTotalNumRounds(): number {
    return this.totalNumRounds;
  };

  setTotalNumRounds(num: number): void {
    this.totalNumRounds = num;
  };

  udateTotalNumRounds(): void {
    this.setTotalNumRounds(this.getTotalNumRounds() + 1);
  };

  // players
  getPlayers(): (SngPlayer | null)[] {
    return this.players;
  };

  setPlayers(players: (SngPlayer | null)[]): void {
    this.players = players;
  };

  resetPlayers(): void {
    this.setPlayers(new Array<SngPlayer | null>(this.numPlayers).fill(null));
  };

  getPlayer(socket: Socket): SngPlayer | null {
    return this.players.find(player => player?.getSocket() === socket) || null;
  };

  setPlayer(seatId: number, player: SngPlayer | null): void {
    this.players[seatId] = player;

    // Broadcast to clients to init player info. And then every data change will automatically reflect on the frontend by every `set` function.
    const broadcast: Msg.SignupBroadcast = {
      seatId: seatId,
      name: player?.getName() || '',
    };
    this.io.emit("SignupBroadcast", broadcast);
  };

  resetPlayer(seatId: number): void {
    this.setPlayer(seatId, null);
  };

  getPlayerSeatId(socket: Socket): number { // If the client is not a player, return -1.
    return this.players.findIndex(player => player?.getSocket() === socket);
  };

  getPlayersNames(): string[] {
    return this.players.map(player => player ? player.getName() : '');
  };

  getPlayersCurrentChips(): number[] {
    return this.players.map(player => player ? player.getCurrentChips() : 0);
  };

  getPlayersCurrentBetSizes(): number[] {
    return this.players.map(player => player ? player.getCurrentBetSize() : 0);
  };

  getPlayersStatuses(): (PlayerStatus | null)[] {
    // return this.players.map(player => player?.getStatus() || null); <- The `||` returns the first operand if it is truthy and the second operand otherwise.
    return this.players.map(player => player ? player.getCurrentStatus() : null); // Since the status of a player can be `0`, we cannot use `||` here.
  };

  getPlayersHoleCards(): Card[][] {
    return this.players.map(player => player ? player.getHoleCards() : []);
  };

  // currentSngStartTime
  getCurrentSngStartTime(): number | null {
    return this.currentSngStartTime;
  };

  setCurrentSngStartTime(time: number | null): void {
    this.currentSngStartTime = time;
  };

  resetCurrentSngStartTime(): void {
    this.setCurrentSngStartTime(null);
  };

  // currentNumSngRounds
  getCurrentNumSngRounds(): number {
    return this.currentNumSngRounds;
  };

  setCurrentNumSngRounds(num: number): void {
    this.currentNumSngRounds = num;
  };

  resetCurrentNumSngRounds(): void {
    this.setCurrentNumSngRounds(0);
  };

  // currentBigBlindSeatId
  getCurrentBigBlindSeatId(): number {
    if (this.currentBigBlindSeatId === null) {
      console.log("currentBigBlindSeatId is null, update it automatically.");
      this.updateCurrentBigBlindSeatId();
      return this.getCurrentBigBlindSeatId();
    } else {
      return this.currentBigBlindSeatId;
    }
  }

  setCurrentBigBlindSeatId(seatId: number | null): void {
    this.currentBigBlindSeatId = seatId;
    console.log(`currentBigBlindSeatId is set to ${seatId}.`);
  };

  updateCurrentBigBlindSeatId(): void {
    if (this.currentBigBlindSeatId === null) {
      const nonNullIds = this.players.map((player, seatId) => player !== null ? seatId : -1).filter(seatId => seatId !== -1);
      this.setCurrentBigBlindSeatId(nonNullIds[Math.floor(Math.random() * nonNullIds.length)]);
    } else {
      let nextBigBlindSeatId = (this.getCurrentBigBlindSeatId() + 1) % this.numPlayers;
      while (this.players[nextBigBlindSeatId] === null) {
        nextBigBlindSeatId = (nextBigBlindSeatId + 1) % this.numPlayers;
      }
      this.setCurrentBigBlindSeatId(nextBigBlindSeatId);
    }
  };

  resetCurrentBigBlindSeatId(): void {
    this.setCurrentBigBlindSeatId(null);
  };

  // currentBlindLevel
  getCurrentBigBlind(): number {
    if (this.currentBlindLevel === 0) {
      console.log("currentBlindLevel is 0, update it automatically.");
      this.updateCurrentBlindLevel();
    }
    return this.blindStructure[this.currentBlindLevel].bigBlind;
  };

  setCurrentBlindLevel(level: number): void {
    this.currentBlindLevel = level;
  };

  updateCurrentBlindLevel(): void {
    this.setCurrentBlindLevel(this.currentBlindLevel + 1);
    this.setLastBlindUpdateTime(Date.now());

    console.log("Current big blind: " + this.getCurrentBigBlind());
  };

  resetCurrentBlindLevel(): void {
    this.setCurrentBlindLevel(0);
    this.resetLastBlindUpdateTime();
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

    this.setCurrentBlindUpdateTimer(setTimeout(() => {
      this.updateCurrentBlindLevel();
      this.setBlinUpTimer();
    }, blindLevelTime));
  };

  // lastBlindUpdateTime
  getLastBlindUpdateTime(): number | null {
    return this.lastBlindUpdateTime;
  };

  setLastBlindUpdateTime(time: number | null): void {
    this.lastBlindUpdateTime = time;
  };

  resetLastBlindUpdateTime(): void {
    this.setLastBlindUpdateTime(null);
  };

  // currentBlindUpdateTimer
  getCurrentBlindUpdateTimer(): NodeJS.Timeout | undefined {
    return this.currentBlindUpdateTimer;
  };

  setCurrentBlindUpdateTimer(timer: NodeJS.Timeout): void {
    this.currentBlindUpdateTimer = timer;
  };

  // currentRound
  getCurrentRound(): SngRound {
    if (!this.currentRound) {
      console.log("currentRound is null, please init it first.");
      this.initCurrentRound();
      return this.getCurrentRound();
    } else {
      return this.currentRound;
    }
  }

  setCurrentRound(round: SngRound | null): void {
    this.currentRound = round;
  };

  initCurrentRound(): void {
    this.setCurrentRound(new SngRound(this, this.players, this.getCurrentBigBlindSeatId(), this.getCurrentBigBlind(), this.getIo()));
    this.getCurrentRound().getDeck().shuffle(); // The deck needs to be shuffled before using it.
  };

  resetCurrentRound(): void {
    this.setCurrentRound(null);
  };

  // client actions
  clientDisconnect(socket: Socket): void {
    const player = this.getPlayer(socket);

    if (player === null) {
      console.log("Specator disconnected. socket.id: " + socket.id);
      return;
    }

    if (this.currentStatus === RoomStatus.NONE) {
      this.clientCancelSignUp(socket);
    } else if (this.currentStatus === RoomStatus.PLAYING) {
      this.playerQuit(socket);
    } else {
      console.error("Unexpected room status: " + this.currentStatus);
      // RICKTODO: Shut down the room...
    }
  }

  clientLoadRoomInfo(socket: Socket): void {
    const response: Msg.LoadRoomInfoResponse = {
      clientSeatId: this.getPlayerSeatId(socket),
      currentPlayerSeatId: this.currentRound ? this.currentRound.getCurrentPlayerSeatId() : null,
      roomCurrentBetSize: this.currentRound ? this.currentRound.getCurrentBetSize() : 0,
      roomCurrentMinRaise: this.currentRound ? this.currentRound.getCurrentMinRaise() : 0,
      roomCurrentStatus: this.getStatus(),
      playersNames: this.getPlayersNames(),
      playersCurrentChips: this.getPlayersCurrentChips(),
      playersCurrentBetSizes: this.getPlayersCurrentBetSizes(),
      playersCurrentStatuses: this.getPlayersStatuses(),
      playersHoleCards: this.getPlayersHoleCards(),
      communityCards: this.currentRound ? this.currentRound.getCommunityCards() : [],
      pots: this.currentRound ? this.currentRound.getPots() : [],
    };
    socket.emit("LoadRoomInfoResponse", response);
  };

  clientSignup(socket: Socket, request: Msg.SignupRequest): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      console.log(socket.id + " signup failed: Cannot signup when the game is started.");
      return;
    }

    if (this.players[request.seatId] !== null) {
      console.log(socket.id + " signup failed: The seat is occupied.");
      return;
    }

    const player = new SngPlayer(request.seatId, request.name, request.email, socket, this.io);
    this.setPlayer(request.seatId, player);

    // Signup success.
    console.log(socket.id + " signup success.");
    const response: Msg.SignupResponse = {
      seatId: request.seatId,
    };
    socket.emit("SignupResponse", response);

    // Swith the socket to the `players` room.
    socket.leave("spectators");
    socket.join("players");
  };

  clientCancelSignUp(socket: Socket): void {
    if (this.currentStatus === RoomStatus.PLAYING) {
      console.log(socket.id + " cancel signup failed: Cannot cancel signup when the game is started.");
      return;
    }

    const seatId = this.getPlayerSeatId(socket);
    if (seatId === -1) {
      console.log(socket.id + " cancel signup failed: Not signed up.");
      return;
    }

    this.resetPlayer(seatId);

    const broadcast: Msg.StandupBroadcast = {
      seatId: seatId,
    };
    this.io.emit("StandupBroadcast", broadcast);
  };

  playerReady(socket: Socket): void {
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
    console.log(socket.id + " is ready.");
    const response: Msg.ReadyResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("ReadyResponse", response);

    // Check if all players are ready.
    if (this.isAllPlayersReady()) {
      this.startSng();
    }
  }

  playerUnready(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.NONE) {
      console.log(socket.id + " unready failed: The game is started.");
      return;
    }

    // if the seat is empty, the player cannot unready
    const player = this.getPlayer(socket);
    if (player === null) {
      console.log(socket.id + " unready failed: Not signed up.");
      return;
    }

    player.unready();
  };

  playerFold(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " fold failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    player.fold();
    player.act();
  
    // Fold success.
    console.log(socket.id + " fold success.");
    const response: Msg.FoldResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("FoldResponse", response);
  
    // End action.
    this.getCurrentRound().endAction();
  }

  playerCheck(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " fold failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    // player.placeBet(0);
    player.act();
  
    // Check success.
    console.log(socket.id + " check success.");
    const response: Msg.CheckResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("CheckResponse", response);

    // End action.
    this.getCurrentRound().endAction();
  }

  playerCall(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " call failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    player.placeBet(this.getCurrentRound().getCurrentBetSize() - player.getCurrentBetSize());
    player.act();

    // Call success.
    console.log(socket.id + " call success.");
    const response: Msg.CallResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("CallResponse", response);

    // End action.
    this.getCurrentRound().endAction();
  }

  playerBet(socket: Socket, request: Msg.BetRequest): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " call failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    if (player.getCurrentBetSize() + request.betAmount < this.getCurrentRound().getCurrentBetSize() + this.getCurrentRound().getCurrentMinRaise()) {
      console.log(socket.id + " bet failed: Bet amount is not enough.");
      return;
    }

    if (player.getCurrentChips() < request.betAmount) {
      console.log(socket.id + " raise failed: Not enough chips.");
      return;
    }

    player.placeBet(request.betAmount);
    player.act();

    this.getCurrentRound().updateCurrentBetSize(player.getCurrentBetSize());

    // Bet success.
    console.log(socket.id + " bet success.");
    const response: Msg.BetResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("BetResponse", response);

    // End action.
    this.getCurrentRound().endAction();
  }

  playerRaise(socket: Socket, request: Msg.RaiseRequest): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " call failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    if (player.getCurrentBetSize() + request.raiseAmount < this.getCurrentRound().getCurrentBetSize() + this.getCurrentRound().getCurrentMinRaise()) {
      console.log(socket.id + " raise failed: Raise amount is not enough.");
      return;
    }

    if (player.getCurrentChips() < request.raiseAmount) {
      console.log(socket.id + " raise failed: Not enough chips.");
      return;
    }

    player.placeBet(request.raiseAmount);
    player.act();

    this.getCurrentRound().updateCurrentBetSize(player.getCurrentBetSize());

    // Raise success.
    console.log(socket.id + " call success.");
    const response: Msg.CallResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("CallResponse", response);

    // End action.
    this.getCurrentRound().endAction();
  }

  playerAllIn(socket: Socket): void {
    if (this.currentStatus !== RoomStatus.PLAYING) {
      console.log(socket.id + " call failed: The game is not started.");
      return;
    }

    const player = this.getPlayer(socket);
    if (player === null || player.getSeatId() !== this.getCurrentRound().getCurrentPlayerSeatId()) {
      console.log(socket.id + " fold failed: Not your turn.");
      return;
    }

    player.placeBet(player.getCurrentChips());
    player.act();

    this.getCurrentRound().updateCurrentBetSize(player.getCurrentBetSize());

    // All-in success.
    console.log(socket.id + " all-in success.");
    const response: Msg.AllInResponse = {
      seatId: this.getPlayerSeatId(socket)
    };
    socket.emit("AllInResponse", response);

    // End action.
    this.getCurrentRound().endAction();
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
  };

  // room functions
  startSng(): void {
    console.log("Current Room: " + this.getStartTime() + " start SNG.");

    // Set the current status to PLAYING.
    this.play();

    // Update the total number of SNGs.
    this.updateTotalNumSngs();

    // Initialize players in the SNG.
    this.initSngPlayers();

    // Initialize the start time of the current SNG.
    this.setCurrentSngStartTime(Date.now());

    // Initialize the number of rounds of the current SNG.
    this.setCurrentNumSngRounds(0);

    // Initialize the current blind level, and set the timeout for updating the blind level
    this.startBlindUp();

    // Start the first round
    this.startRound();
  };

  startRound(): void {
    console.log("Current Room: " + this.getStartTime() + " start Round.");

    // Update totalNumRounds.
    this.udateTotalNumRounds();

    // Update current bmallBlind seatId.
    this.updateCurrentBigBlindSeatId();

    // Create a new round.
    this.initCurrentRound();

    // Initialize players in the round.
    this.getCurrentRound().initRoundPlayers();

    // Start the first street.
    this.getCurrentRound().startStreet();
  };

  endRound(): void {
    console.log("Current Room: " + this.getStartTime() + " end Round.");

    // Initialize players in the round.
    this.getCurrentRound().resetRoundPlayers();

    // Reset current round.
    this.setCurrentRound(null);

    // Eliminate players who have no chips.
    this.roundElimination();

    // Notify the clients to refresh the room.
    this.getIo().emit("RoundEndBroadcast");

    // Check if the SNG is ended.
    if (this.getNumOfPlayersStillInSng() < 2) {
      this.endSng();
    } else {
      this.startRound();
    }
  }  

  endSng(): void {
    console.log("Current Room: " + this.getStartTime() + " end SNG.");

    // RICKTODO: Send email to the players
    // this.sendSngResult();

    // Reset players.
    this.resetPlayers();

    // Reset the start time of the current SNG.
    this.resetCurrentSngStartTime();

    // Reset the number of rounds of the current SNG.
    this.resetCurrentNumSngRounds();
  
    // Reset the current bmallBlind.
    this.resetCurrentBigBlindSeatId();

    // Reset the currentBlindLevel, lastBlindUpdateTime, and clear thte timer.
    this.endBlindUp();

    // Set currentStatus to NONE.
    this.reset();

    // Notify the clients to refresh the room.
    this.getIo().emit("SngEndBroadcast");
  }

  // utility functions
  isAllPlayersReady(): boolean {
    return this.getNumOfPlayers() >= 2 && this.players.filter(player => player !== null).every(player => player?.getCurrentStatus() === PlayerStatus.READY);
  };

  roundElimination(): void {
    this.getPlayersStillInSng().forEach(player => (player?.getCurrentChips() || 0) <= 0 ? player?.endSng() : null);
  };

  getPlayersStillInSng(): (SngPlayer | null)[]{
    return this.players.filter(player => player?.isStillInSng());
  };

  getNumOfPlayersStillInSng(): number {
    return this.getPlayersStillInSng().length;
  };

  getNumOfPlayers(): number {
    return this.players.filter(player => player !== null).length;
  };

  initSngPlayers(): void {
    this.players.forEach(player => player?.startSng(this.initChips));
  };
}
