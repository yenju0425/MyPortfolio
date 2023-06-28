import type { Server } from 'socket.io';
import { Round } from '@/games/base/round';
import { SngRoom } from "./sngRoom";
import { Card, Deck } from './deck';
import { Pot } from './pots';
import { Streets } from './terms';
import { SngPlayer } from './sngPlayer';
import * as Msg from "@/types/messages";

export class SngRound extends Round {
  private readonly room: SngRoom;
  private readonly bigBlindSeatId: number; // If there are only two players, the big blind is the dealer.
  private readonly bigBlind: number;
  private readonly players: (SngPlayer | null)[];
  private communityCards: Card[];
  private deck: Deck;
  private pots: Pot[];
  private currentStreet: Streets;
  private currentPlayerSeatId: number | null; // displayed or used in the frontend
  private currentBetSize: number; // displayed or used in the frontend
  private currentMinRaise: number; // displayed or used in the frontend RICKTODO

  constructor(room: SngRoom, players: (SngPlayer | null)[], bigBlindSeatId: number, bigBlind: number, io: Server) {
    super(io);
    this.room = room;
    this.bigBlindSeatId = bigBlindSeatId;
    this.bigBlind = bigBlind;
    this.players = players;
    this.communityCards = [];
    this.deck = new Deck(); // The deck needs to be shuffled after created.
    this.pots = [];
    this.currentStreet = Streets.NONE;
    this.currentPlayerSeatId = null;
    this.currentBetSize = 0;
    this.currentMinRaise = 0;
  }

  // room
  getRoom(): SngRoom {
    return this.room;
  }

  // bigBlindSeatId
  getBigBlindSeatId(): number {
    return this.bigBlindSeatId;
  }

  // bigBlind
  getBigBlind(): number {
    return this.bigBlind;
  }

  // players
  getPlayers(): (SngPlayer | null)[] {
    return this.players;
  }

  getCurrentPlayer(): SngPlayer | null {
    return this.players[this.getCurrentPlayerSeatId()];
  }
    
  // communityCards
  getCommunityCards(): Card[] {
    return this.communityCards;
  }

  // deck
  getDeck(): Deck {
    return this.deck;
  }

  // Pots
  getPots(): Pot[] {
    return this.pots;
  }

  setPots(pots: Pot[]): void {
    this.pots = pots;
  }

  updatePots(): void {
    const newPots: Pot[] = [];
    let potContribations = this.players.map((player, index) => [index, player?.getCurrentPotContribution() || 0]).filter(([, contribution]) => contribution > 0).sort((a, b) => a[1] - b[1]);
    while (potContribations.length > 0) {
      newPots.push({
        amount: potContribations[0][1] * potContribations.length,
        participants: potContribations.map(([index]) => index)
      });
      potContribations = potContribations.map(([index, contribution]) => [index, contribution - potContribations[0][1]]).filter(([, contribution]) => contribution > 0);
    }

    this.setPots(newPots);
  }

  // currentStreet
  getCurrentStreet(): Streets {
    return this.currentStreet;
  }

  setCurrentStreet(street: Streets): void {
    this.currentStreet = street;
  }

  updateCurrentStreet(): void {
    this.setCurrentStreet(this.getCurrentStreet() + 1);
  }

  // currentBetSize
  broadcastCurrentBetSize(): void {
    const broadcast: Msg.RoomCurrentBetSizeUpdateBroadcast = {
      roomCurrentBetSize: this.getCurrentBetSize()
    };
    this.io.emit('RoomCurrentBetSizeUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentBetSize: " + JSON.stringify(broadcast));
  }

  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  setCurrentBetSize(amount: number): void {
    this.currentBetSize = amount;
    this.broadcastCurrentBetSize();
  }

  updateCurrentBetSize(amount: number): void {
    const betSize = Math.max(this.getCurrentBetSize(), amount);
    const raise = betSize - this.getCurrentBetSize();
    this.setCurrentBetSize(Math.max(this.getCurrentBetSize(), amount));
    this.updateCurrentMinRaise(raise);
  }

  initCurrentBetSize(): void {
    this.setCurrentBetSize(0);
  }

  // currentMinRaise
  broadcastCurrentMinRaise(): void {
    const broadcast: Msg.RoomCurrentMinRaiseUpdateBroadcast = {
      roomCurrentMinRaise: this.getCurrentMinRaise()
    };
    this.io.emit('RoomCurrentMinRaiseUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentMinRaise: " + JSON.stringify(broadcast));
  }

  getCurrentMinRaise(): number {
    return this.currentMinRaise;
  }

  setCurrentMinRaise(amount: number): void {
    this.currentMinRaise = amount;
    this.broadcastCurrentMinRaise();
  }

  updateCurrentMinRaise(amount: number): void {
    this.setCurrentMinRaise(Math.max(this.getCurrentMinRaise(), amount));
  }

  initCurrentMinRaise(): void {
    this.setCurrentMinRaise(this.getBigBlind());
  }

  // currentPlayerSeatId
  broadcastCurrentPlayerSeatId(): void {
    const broadcast: Msg.CurrentPlayerSeatIdUpdateBroadcast = {
      currentPlayerSeatId: this.getCurrentPlayerSeatId()
    };
    this.io.emit('CurrentPlayerSeatIdUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentPlayerSeatId: " + JSON.stringify(broadcast));
  }

  getCurrentPlayerSeatId(): number {
    if (this.currentPlayerSeatId === null) {
      console.log("currentPlayerSeatId is null, update it automatically.");
      this.updateCurrentPlayerSeatId();
      return this.getCurrentPlayerSeatId();
    } else {
      return this.currentPlayerSeatId;
    }
  }

  setCurrentPlayerSeatId(seatId: number): void {
    this.currentPlayerSeatId = seatId;
    this.broadcastCurrentPlayerSeatId();
  }

  updateCurrentPlayerSeatId(): void {
    let nextPlayerSeatId = (this.getCurrentPlayerSeatId() + 1) % this.players.length;
    while(!this.players[nextPlayerSeatId]?.isStillInStreet()) {
      nextPlayerSeatId = (nextPlayerSeatId + 1) % this.players.length
    }
    this.setCurrentPlayerSeatId(nextPlayerSeatId);
  }

  initCurrentPlayerSeatId(): void {
    const currentPlayerId = this.getPlayers().findIndex(player => player?.getCurrentPosition() === 0); // dealer
    if (currentPlayerId !== -1) {
      this.setCurrentPlayerSeatId(currentPlayerId);
    } else {
      this.setCurrentPlayerSeatId(this.getBigBlindSeatId());
    }
  }

  resetCurrentPlayerSeatId(): void {
    this.setCurrentPlayerSeatId(this.getBigBlindSeatId());
  }

  // round functions
  startStreet(): void {
    console.log('[RICKDEBUG] startStreet');

    // this.get [RICKTODO]: next street
    this.updateCurrentStreet();

    // Initialize players in the street.
    this.initStreetPlayers();
  
    // Initialize current player seat id.
    this.initCurrentPlayerSeatId();

    // Initialize current bet size.
    this.initCurrentBetSize();

    // Initialize current min raise.
    this.initCurrentMinRaise();

    // Start the first action.
    this.startAction();
  }

  startAction(): void {
    // Update current player seat id, the client will figure out if it is its turn.
    this.updateCurrentPlayerSeatId();

    // Get current player.
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('currentPlayer is null');
      this.endAction();
      return;
    }

    console.log('[RICKDEBUG] startAction', this.getCurrentPlayerSeatId(), currentPlayer.getCurrentPosition());
    
    // Automatically place bet for small blind and big blind.
    if (this.getCurrentStreet() === Streets.PREFLOP) {
      if (currentPlayer?.getCurrentPosition() === 1 && !currentPlayer.getCurrentBetSize()) { // small blind
        console.log('player: ' + currentPlayer?.getName() + ' is small blind');
        currentPlayer.placeBet(this.getBigBlind() / 2);
        this.updateCurrentBetSize(this.getBigBlind() / 2);
        this.endAction();
        return;
      } else if (currentPlayer?.getCurrentPosition() === 2 && !currentPlayer.getCurrentBetSize()) { // big blind
        console.log('player: ' + currentPlayer?.getName() + ' is big blind');
        currentPlayer.placeBet(this.getBigBlind());
        this.updateCurrentBetSize(this.getBigBlind());
        this.endAction();
        return;
      }
    }
  }

  endAction(): void {
    console.log('[RICKDEBUG] endAction');

    if (this.getNumOfPlayersStillInStreet() < 2) {
      this.endStreet();
    } else if (this.isAllPlayersActed() && this.isBetConsensusReached()) {
      this.endStreet();
    } else {
      this.startAction();
    }
  }

  endStreet(): void {
    console.log('[RICKDEBUG] endStreet');

    this.updatePots();

    // TODO: return the overbet chips to the player

    if (this.getNumOfPlayersStillInRound() < 2) {
      this.rewardPotsToWinners();
      this.getRoom().endRound();
    } else if (this.getCurrentStreet() === Streets.RIVER) {
      this.calculatePlayersHandRanking();
      this.rewardPotsToWinners();
      this.getRoom().endRound();
    } else {
      this.startStreet();
    }
  }

  // utility functions
  isAllPlayersActed(): boolean {
    return this.players.filter(player => player !== null).every(player => player?.isActed());
  }

  isBetConsensusReached(): boolean {
    return this.players.filter(player => player !== null && player?.isStillInStreet()).every(player => player?.getCurrentBetSize() === this.getCurrentBetSize() || player?.isAllIn());
  }

  getNumOfPlayersStillInRound(): number {
    return this.players.filter(player => player?.isStillInRound()).length;
  }

  getNumOfPlayersStillInStreet(): number {
    return this.players.filter(player => player?.isStillInStreet()).length;
  }

  calculatePlayersHandRanking(): void {
    for (let player of this.players) {
      let cards = player?.getHoleCards().concat(this.getCommunityCards()).filter(card => card !== null) || [];
      player?.setHandRanking(this.getDeck().calculateHandRanking(cards));
    }
  }

  getActivePotParticipants(pot: Pot): number[] { // Filter out the participants who already folded or quit.
    return pot.participants.filter(participantId => this.players[participantId]?.isStillInRound());
  }

  getPotWinnerIds(pot: Pot): number[] {
    let winners: number[] = [];
    let maxHandRanking = 0;
    for (let participantId of this.getActivePotParticipants(pot)) {
      const handRanking = this.players[participantId]?.getHandRanking() || -1;
      if (handRanking > maxHandRanking) {
        maxHandRanking = handRanking;
        winners = [participantId];
      } else if (handRanking === maxHandRanking) {
        winners.push(participantId);
      }
    }
    return winners;
  }

  rewardPotsToWinners(): void {
    for (let i = 0; i < this.pots.length; i++) {
      const numOfActivePotParticipants = this.getActivePotParticipants(this.pots[i]).length;
      const getPotWinnerIds = this.getPotWinnerIds(this.pots[i]);
      const rewardAmount = Math.floor(this.pots[i].amount / getPotWinnerIds.length); // Math.floor is used to ensure the reward amount is an integer.
      for (let winnerId of getPotWinnerIds) {
        this.players[winnerId]?.receivePotReward(rewardAmount);
        if (numOfActivePotParticipants > 1) { // The winner needs to show the cards if there are more than one active participants in the pot.
          this.players[winnerId]?.showCards();
        }
      }
    } 
  }

  initRoundPlayers(): void {
    let position = 2; // 0: dealer, 1: small blind, 2: big blind
    for (let i = 0; i < this.players.length; i++) {
      let index = (this.bigBlindSeatId - i + this.players.length) % this.players.length;

      console.log(index, position);
      this.players[index]?.startRound(position, [this.getDeck().deal(), this.getDeck().deal()]);
      if (this.players[index]) {
        position = (position - 1 + this.players.length) % this.players.length; // If there are 2 players, small blind will be the dealer.
      }
    }
  }

  initStreetPlayers(): void {
    this.players.forEach(player => player?.startStreet());
  }
}
