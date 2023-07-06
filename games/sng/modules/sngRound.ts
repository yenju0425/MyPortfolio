import type { Server } from 'socket.io';
import { Round } from '@/games/base/round';
import { SngRoom } from "./sngRoom";
import { Card, Deck } from './deck';
import { Pot } from './pot';
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
  private currentMinRaise: number; // displayed or used in the frontend

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

  getPlayer(seatId: number): SngPlayer | null {
    return this.players[seatId];
  }

  getCurrentPlayer(): SngPlayer | null {
    const currentPlayerSeatId = this.getCurrentPlayerSeatId();
    return currentPlayerSeatId === null ? null : this.players[currentPlayerSeatId];
  }

  // communityCards
  broadcastCommunityCards(): void {
    const broadcast: Msg.CommunityCardsUpdateBroadcast = {
      communityCards: this.getCommunityCards()
    };
    this.io.emit('CommunityCardsUpdateBroadcast', broadcast);
  }

  getCommunityCards(): Card[] {
    return this.communityCards;
  }

  setCommunityCards(communityCards: Card[]): void {
    this.communityCards = communityCards;
    this.broadcastCommunityCards();
  }

  updateCommunityCards(Cards: Card[]): void {
    this.setCommunityCards([...this.getCommunityCards(), ...Cards]);
  }

  // deck
  getDeck(): Deck {
    return this.deck;
  }

  // Pots
  broadcastPots(): void {
    const broadcast: Msg.PotsUpdateBroadcast = {
      pots: this.getPots()
    };
    this.io.emit('PotsUpdateBroadcast', broadcast);
  }

  getPots(): Pot[] {
    return this.pots;
  }

  setPots(pots: Pot[]): void {
    this.pots = pots;
    this.broadcastPots();
  }

  updatePots(): void {
    const newPots: Pot[] = [];
    let potContribations = this.players.map((player, index) => [index, player?.getCurrentPotContribution() || 0]).filter(([, contribution]) => contribution > 0).sort((a, b) => a[1] - b[1]);
    while (potContribations.length > 1) {
      newPots.push({
        amount: potContribations[0][1] * potContribations.length,
        participants: potContribations.map(([index]) => index)
      });
      potContribations = potContribations.map(([index, contribution]) => [index, contribution - potContribations[0][1]]).filter(([, contribution]) => contribution > 0);
    }

    // Return the excess bet to the remaining player
    if (potContribations.length === 1) {
      this.getPlayer(potContribations[0][0])?.updateCurrentChips(potContribations[0][1]);
      this.getPlayer(potContribations[0][0])?.updateCurrentPotContribution(-potContribations[0][1]);
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
  }

  getCurrentPlayerSeatId(): number | null {
    return this.currentPlayerSeatId;
  }

  setCurrentPlayerSeatId(seatId: number | null): void {
    this.currentPlayerSeatId = seatId;
    this.broadcastCurrentPlayerSeatId();
  }

  updateCurrentPlayerSeatId(): void {
    const currentPlayerSeatId = this.getCurrentPlayerSeatId();
    if (currentPlayerSeatId === null) {
      console.log("CurrentPlayerSeatId is null, unable to update.");
      return;
    }
    let nextPlayerSeatId = (currentPlayerSeatId + 1) % this.players.length;
    while (!this.players[nextPlayerSeatId]?.isStillInStreet()) {
      nextPlayerSeatId = (nextPlayerSeatId + 1) % this.players.length;
    }
    this.setCurrentPlayerSeatId(nextPlayerSeatId);
  }

  initCurrentPlayerSeatId(): void {
    // You should use getPlayers() instead of getPlayersStillInRound() here, or you will get a wrong index.
    const currentPlayerId = this.getPlayers().findIndex(player => player?.getCurrentPosition() === 0); // dealer
    if (currentPlayerId !== -1) {
      this.setCurrentPlayerSeatId(currentPlayerId);
    } else {
      if (this.getCurrentStreet() === Streets.PREFLOP) {
        this.setCurrentPlayerSeatId(this.getBigBlindSeatId());
      } else {
        this.setCurrentPlayerSeatId(this.getPlayers().findIndex(player => player?.getCurrentPosition() === 1)); // small blind
      }
    }
  }

  resetCurrentPlayerSeatId(): void {
    this.setCurrentPlayerSeatId(null);
  }

  // round functions
  startStreet(): void {
    console.log("Current round: " + this.getStartTime() + " start street.");

    // Update current street.
    this.updateCurrentStreet();

    // Deal community cards.
    this.dealCommunityCards();

    // Initialize players in the street.
    this.initStreetPlayers();
  
    // Initialize current player seat id.
    this.initCurrentPlayerSeatId();

    // Initialize current bet size.
    this.initCurrentBetSize();

    // Initialize current min raise.
    this.initCurrentMinRaise();

    // Start action.
    if (this.getNumOfPlayersStillInStreet() < 2) {
      this.endStreet();
    } else {
      this.startAction();
    }
  }

  startAction(): void {
    console.log("Current round: " + this.getStartTime() + " start action.");

    // Update current player seat id, the client will figure out if it is its turn.
    this.updateCurrentPlayerSeatId();

    // Get current player.
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      console.error('currentPlayer is null');
      this.endAction();
      return;
    }

    // Automatically place bet for small blind and big blind.
    if (this.getCurrentStreet() === Streets.PREFLOP) {
      if (currentPlayer?.getCurrentPosition() === 1 && currentPlayer.getCurrentBetSize() <= 0) { // small blind
        console.log("player: " + currentPlayer?.getName() + " is small blind");
        currentPlayer.placeBet(this.getBigBlind() / 2);
        this.updateCurrentBetSize(this.getBigBlind() / 2);
        this.endAction();
        return;
      } else if (currentPlayer?.getCurrentPosition() === 2 && currentPlayer.getCurrentBetSize() <= 0) { // big blind
        console.log("player: " + currentPlayer?.getName() + " is big blind");
        currentPlayer.placeBet(this.getBigBlind());
        this.updateCurrentBetSize(this.getBigBlind()); // You should not use currentPlayer.getCurrentBetSize() since the player may have not emough chips to place a blind bet.
        this.endAction();
        return;
      }
    }
  }

  endAction(): void {
    console.log("Current round: " + this.getStartTime() + " end action.");

    // Special cases:
    // - When there are 3 players and player 1 goes ALL-IN while player 2 also goes ALL-IN, player 3 should still be able to act.
    // - When there are only 2 players left and one player folds, causing the number of players remaining in the current round to be less than 2, the current round should end.
    // - When there are 3 players and player 1 is supposed to be the small blind but doesn't have enough chips to place a bet (Auto ALL-IN), player 2 becomes the big blind (Auto ALL-IN), and player 3 calls, the current round should end.
    if (this.isStreetEnded()) {
      this.endStreet();
    } else {
      this.startAction();
    }
  }

  endStreet(): void {
    console.log("Current round: " + this.getStartTime() + " end street.");

    this.updatePots();
    this.resetCurrentPlayerSeatId();
    this.resetStreetPlayers();

    if (this.getNumOfPlayersStillInRound() < 2) {
      this.rewardPotsToWinners();
      setTimeout(() => {
        this.getRoom().endRound();
      }, 5000);
    } else if (this.getCurrentStreet() === Streets.RIVER) {
      this.calculatePlayersHandRanking();
      this.rewardPotsToWinners();
      setTimeout(() => {
        this.getRoom().endRound();
      }, 10000);
    } else {
      this.startStreet();
    }
  }

  // utility functions
  isAllPlayersActed(): boolean {
    return this.getPlayersStillInStreet().every(player => player?.isActed());
  }

  isBetConsensusReached(): boolean {
    return this.getPlayersStillInRound().every(player => player?.getCurrentBetSize() === this.getCurrentBetSize() || player?.isAllIn());
  }

  isStreetEnded(): boolean {
    return this.getNumOfPlayersStillInRound() < 2 || ((this.getNumOfPlayersStillInStreet() < 2 || this.isAllPlayersActed()) && this.isBetConsensusReached());
  }

  getPlayersStillInRound(): (SngPlayer | null)[] {
    return this.players.filter(player => player?.isStillInRound());
  }

  getNumOfPlayersStillInRound(): number {
    return this.getPlayersStillInRound().length;
  }

  getPlayersStillInStreet(): (SngPlayer | null)[] {
    return this.players.filter(player => player?.isStillInStreet());
  }

  getNumOfPlayersStillInStreet(): number {
    return this.getPlayersStillInStreet().length;
  }

  getPlayersStillInSng(): (SngPlayer | null)[] {
    return this.players.filter(player => player?.isStillInSng());
  }

  getNumOfPlayersStillInSng(): number {
    return this.getPlayersStillInSng().length;
  }

  getPlayersAllIn(): (SngPlayer | null)[] {
    return this.players.filter(player => player?.isAllIn());
  }

  getNumOfPlayersAllIn(): number {
    return this.getPlayersAllIn().length;
  }

  calculatePlayersHandRanking(): void {
    for (let player of this.players) {
      if (player) {
        player.setHandRanking(this.getDeck().calculateHandRanking(player.getHoleCards().concat(this.getCommunityCards()).filter(card => card !== null)));
      }
    }
  }

  getActivePotParticipants(pot: Pot): number[] { // Filter out the participants who already folded or quit.
    return pot.participants.filter(participantId => this.players[participantId]?.isStillInRound());
  }

  getPotWinnerIds(pot: Pot): number[] {
    let winners: number[] = [];
    let maxHandRanking = 0;
    for (let participantId of this.getActivePotParticipants(pot)) {
      const handRanking = this.players[participantId]?.getHandRanking();
      if (handRanking === undefined) {
        continue;
      }
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
    const isAnyPlayerAllIn = this.getNumOfPlayersAllIn() > 0;
    const showDownPlayerIds = new Set<number>();
    for (let i = 0; i < this.pots.length; i++) {
      const activePotParticipantIds = this.getActivePotParticipants(this.pots[i]);
      const numOfActivePotParticipants = activePotParticipantIds.length;
      const getPotWinnerIds = this.getPotWinnerIds(this.pots[i]);
      const rewardAmount = Math.floor(this.pots[i].amount / getPotWinnerIds.length); // Math.floor is used to ensure the reward amount is an integer.
      for (let winnerId of getPotWinnerIds) {
        this.players[winnerId]?.receivePotReward(rewardAmount);
        if (numOfActivePotParticipants > 1) { // The winner needs to show the cards if there are more than one active participants in the pot.
          showDownPlayerIds.add(winnerId);
        }
      }
      if (isAnyPlayerAllIn) {
        activePotParticipantIds.forEach(participantId => showDownPlayerIds.add(participantId));
      }
    }

    // show down
    showDownPlayerIds.forEach(playerId => this.getPlayer(playerId)?.showDown());
  }

  initRoundPlayers(): void {
    let position = 2; // 0: dealer, 1: small blind, 2: big blind
    for (let i = 0; i < this.players.length; i++) {
      let index = (this.bigBlindSeatId - i + this.players.length) % this.players.length;
      const player = this.players[index];
      if (player?.isStillInSng()) { // Cannot use isStillInRound() because the player might have folded in the previous round.
        player.startRound(position, [this.getDeck().deal(), this.getDeck().deal()]);
        position = (position - 1 + this.players.length) % this.players.length; // If there are 2 players, small blind will be the dealer.
      }
    }
  }

  resetRoundPlayers(): void {
    this.getPlayersStillInSng().forEach(player => player?.endRound()); // You should use getPlayersStillInSng() since the player might have been out of round in the previous round.
  }

  initStreetPlayers(): void {
    this.getPlayersStillInRound().forEach(player => player?.startStreet());
  }

  resetStreetPlayers(): void {
    this.getPlayersStillInSng().forEach(player => player?.endStreet()); // You should use getPlayersStillInSng() since the player might have been out of street in the previous street.
  }

  dealCommunityCards(): void {
    if (this.getCurrentStreet() === Streets.FLOP) {
      this.updateCommunityCards([this.getDeck().deal(), this.getDeck().deal(), this.getDeck().deal()]);
    } else if (this.getCurrentStreet() === Streets.TURN || this.getCurrentStreet() === Streets.RIVER) {
      this.updateCommunityCards([this.getDeck().deal()]);
    }
  }
}
