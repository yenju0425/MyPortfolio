import type { Server, Socket } from 'socket.io';
import { Player } from '@/games/base/player';
import { PlayerStatus } from '@/games/base/terms';
import { Card } from './deck';
import * as Msg from "@/types/messages";

export class SngPlayer extends Player {
  // sng
  private currentChips: number; // displayed or used in the frontend
  // round
  private currentPosition: number | null;
  private holeCards: Card[]; // displayed or used in the frontend
  private currentPotContribution: number;
  private folded: boolean;
  private handRanking: number; // hexadecimal, e.g. AA335 -> 0x['3' + '00E35']
  // street
  private currentBetSize: number; // displayed or used in the frontend
  private acted: boolean; // whether the player has acted in the current street, small blind & big blind are not considered as acted

  constructor(seatId: number, name: string, email: string, socket: Socket, io: Server) {
    super(seatId, name, email, socket, io);
    // sng
    this.currentChips = 0;
    // round
    this.currentPosition = null;
    this.holeCards = [];
    this.currentPotContribution = 0;
    this.folded = false;
    this.handRanking = 0;
    // street
    this.currentBetSize = 0;
    this.acted = false;
  }

  // currentChips, displayed in the frontend
  broadcastCurrentChips(): void {
    const broadcast: Msg.PlayerCurrentChipsUpdateBroadcast = {
      seatId: this.getSeatId(),
      playerCurrentChips: this.getCurrentChips()
    };
    this.io.emit('PlayerCurrentChipsUpdateBroadcast', broadcast);
  }

  getCurrentChips(): number {
    return this.currentChips;
  }

  setCurrentChips(currentChips: number): void {
    this.currentChips = currentChips;
    this.broadcastCurrentChips();
  }

  updateCurrentChips(chips: number): void {
    this.setCurrentChips(this.getCurrentChips() + chips); // Must use `set` to trigger broadcast
  }

  resetCurrentChips(): void {
    this.setCurrentChips(0);
  }

  // currentPosition
  getCurrentPosition(): number | null {
    return this.currentPosition;
  }

  setCurrentPosition(currentPosition: number | null): void {
    this.currentPosition = currentPosition;
  }

  resetCurrentPosition(): void {
    this.setCurrentPosition(null);
  }

  // holeCards, displayed in the frontend
  broadcastHoleCards(): void {
    const broadcast: Msg.PlayerHoleCardsUpdateBroadcast = {
      seatId: this.getSeatId(),
      playerHoleCards: this.getHoleCards()
    };
    // this.io.emit('PlayerHoleCardsUpdateBroadcast', broadcast); <- The hold cards are private to the player, do not broadcast to other players.
    // console.log("[RICKDEBUG] broadcastHoleCards: " + JSON.stringify(broadcast));
    this.socket.to("spectators").emit("PlayerHoleCardsUpdateBroadcast", broadcast); // Broadcast to spectators and the player himself
    this.socket.emit("PlayerHoleCardsUpdateBroadcast", broadcast);
  }

  getHoleCards(): Card[] {
    return this.holeCards;
  }

  setHoleCards(holeCards: Card[]): void {
    this.holeCards = holeCards;
    this.broadcastHoleCards();
  }

  resetHoleCards(): void {
    this.setHoleCards([]);
  }

  // currentPotContribution
  getCurrentPotContribution(): number {
    return this.currentPotContribution;
  }

  setCurrentPotContribution(currentPotContribution: number): void {
    this.currentPotContribution = currentPotContribution;
  }

  updateCurrentPotContribution(chips: number): void {
    this.setCurrentPotContribution(this.getCurrentPotContribution() + chips);
  }

  resetCurrentPotContribution(): void {
    this.setCurrentPotContribution(0);
  }

  // folded
  fold() {
    this.folded = true;
  }

  isFold(): boolean {
    return this.folded;
  }

  resetFolded() {
    this.folded = false;
  }

  // handRanking
  getHandRanking(): number {
    return this.handRanking;
  }

  setHandRanking(handRanking: number): void {
    this.handRanking = handRanking;
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " has handRanking: " + this.getHandRanking());
  }

  resetHandRanking(): void {
    this.setHandRanking(0);
  }

  // currentBetSize, displayed in the frontend
  broadcastCurrentBetSize(): void {
    const broadcast: Msg.PlayerCurrentBetSizeUpdateBroadcast = {
      seatId: this.getSeatId(),
      playerCurrentBetSize: this.getCurrentBetSize()
    };
    this.io.emit('PlayerCurrentBetSizeUpdateBroadcast', broadcast);
  }

  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  setCurrentBetSize(chips: number): void {
    this.currentBetSize = chips;
    this.broadcastCurrentBetSize();
  }

  updateCurrentBetSize(chips: number): void {
    this.setCurrentBetSize(this.getCurrentBetSize() + chips);
  }

  resetCurrentBetSize(): void {
    this.setCurrentBetSize(0);
  }

  // acted
  act(): void { // act() is called when the player acts in the current street, e.g. call, raise, all-in, etc.
    this.acted = true;
  }

  isActed(): boolean {
    return this.acted;
  }

  resetActed(): void {
    this.acted = false;
  }

  // player functions
  startSng(initialChips: number): void {
    this.play();
    this.setCurrentChips(initialChips);
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " started the game, status: " + this.getCurrentStatus() + ", chips: " + this.getCurrentChips());
  }

  startRound(position: number, cards: Card[]): void {
    this.setCurrentPosition(position);
    this.setHoleCards(cards);
    // this.resetCurrentPotContribution();
    // this.resetFolded();
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " started the round, position: " + this.getCurrentPosition() + ", holeCards: " + this.getHoleCards());
  }

  startStreet(): void {
    // this.resetCurrentBetSize();
    // this.resetActed();
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " started the street.");
  }

  // startAct(): void {
  // }

  // endAct(): void {
  // }

  endStreet(): void {
    this.resetCurrentBetSize();
    this.resetActed();
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " ended the street, betSize: " + this.getCurrentBetSize() + ", acted: " + this.isActed());
  }

  endRound(): void {
    this.resetCurrentPotContribution();
    this.resetFolded();
    console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " ended the round, potContribution: " + this.getCurrentPotContribution() + ", folded: " + this.isFold());
  }

  endSng(): void {
  }

  placeBet(amount: number) { // `placeBet()` is called when the player places a bet, e.g. small blind, big blind, call, raise, all-in ,etc.
    if (amount <= 0) {    
      console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " placed a bet of amount: " + amount + ", which is invalid.");
      return;
    }

    if (amount > this.getCurrentChips()) {
      console.log("The player: " + this.getName() + " of SeatId: " + this.getSeatId() + " placed a bet of amount: " + amount + ", which is more than the current chips: " + this.getCurrentChips() + ". Betting all-in.");
      amount = this.getCurrentChips();
    }

    this.updateCurrentChips(-amount);   
    this.updateCurrentBetSize(amount);
    this.updateCurrentPotContribution(amount);
  }

  receivePotReward(amount: number): void {
    this.updateCurrentChips(amount);
  }

  showCards(): void {
    // RICKTODO: notify the player that he/she has shown the cards
  }

  // utility functions
  isStillInSng(): boolean {
    return this.getCurrentStatus() === PlayerStatus.PLAYING;
  }

  isStillInRound(): boolean {
    return this.isStillInSng() && !this.folded;
  }

  isStillInStreet(): boolean {
    return this.isStillInRound() && this.currentChips > 0;
  }

  isAllIn(): boolean {
    return this.isStillInRound() && this.currentChips === 0;
  }

  eliminateFromSng(): void {
    this.eliminate();
    this.resetCurrentChips();
    this.resetCurrentPosition();
    this.resetHoleCards();
    this.resetCurrentPotContribution(); // End Round
    this.resetFolded(); // End Round
    this.resetHandRanking();
    this.resetCurrentBetSize(); // End Street
    this.resetActed(); // End street
  }
}
