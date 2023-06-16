import { Player } from '../../base/player';
import { Card } from './deck';
import { Server, Socket } from 'socket.io';
import { PlayerStatus } from '../../base/terms';
import * as Msg from "../../../types/messages";

export class SngPlayer extends Player {
  // sng
  private currentChips: number; // displayed in the frontend
  // round
  private currentPosition: number | null;
  private holeCards: Card[]; // displayed in the frontend
  private currentPotContribution: number;
  private folded: boolean;
  private handRanking: number; // hexadecimal, e.g. AA335 -> 0x['3' + '00E35']
  // street
  private currentBetSize: number; // displayed in the frontend
  private acted: boolean; // whether the player has acted in the current street, small blind & big blind are not considered as acted

  constructor(id: number, name: string, email: string, socket: Socket, io: Server) {
    super(id, name, email, socket, io);
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
      seatId: this.getId(),
      playerCurrentChips: this.getCurrentChips()
    };
    this.io.emit('PlayerCurrentChipsUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentChips: " + JSON.stringify(broadcast));
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

  // currentPosition
  getCurrentPosition(): number | null {
    return this.currentPosition;
  }

  setCurrentPosition(currentPosition: number): void {
    this.currentPosition = currentPosition;
  }

  // holeCards, displayed in the frontend
  broadcastHoleCards(): void {
    const broadcast: Msg.PlayerHoleCardsUpdateBroadcast = {
      seatId: this.getId(),
      playerHoleCards: this.getHoleCards()
    };
    this.io.emit('PlayerHoleCardsUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastHoleCards: " + JSON.stringify(broadcast));
  }

  getHoleCards(): Card[] {
    return this.holeCards;
  }

  setHoleCards(holeCards: Card[]): void {
    this.holeCards = holeCards;
    this.broadcastHoleCards();
  }

  // currentPotContribution
  getCurrentPotContribution(): number {
    return this.currentPotContribution;
  }

  setCurrentPotContribution(currentPotContribution: number): void {
    this.currentPotContribution = currentPotContribution;
  }

  // folded
  fold() {
    this.folded = true;
  }

  resetFolded() {
    this.folded = false;
  }

  isFold(): boolean {
    return this.folded;
  }

  // handRanking
  getHandRanking(): number {
    return this.handRanking;
  }

  setHandRanking(handRanking: number): void {
    this.handRanking = handRanking;
  }

  // currentBetSize, displayed in the frontend
  broadcastCurrentBetSize(): void {
    const broadcast: Msg.PlayerCurrentBetSizeUpdateBroadcast = {
      seatId: this.getId(),
      playerCurrentBetSize: this.getCurrentBetSize()
    };
    this.io.emit('PlayerCurrentBetSizeUpdateBroadcast', broadcast);
    console.log("[RICKDEBUG] broadcastCurrentBetSize: " + JSON.stringify(broadcast));
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

  // acted
  act(): void { // act() is called when the player acts in the current street, e.g. call, raise, all-in, etc.
    this.acted = true;
  }

  resetActed(): void {
    this.acted = false;
  }

  isActed(): boolean {
    return this.acted;
  }

  // player functions
  startSng(initialChips: number): void {
    this.play();
    this.setCurrentChips(initialChips);

    console.log(this.socket.id + ' started the game, status: ' + this.currentStatus + ', chips: ' + this.currentChips);
  }

  startRound(position: number, cards: Card[]): void {
    this.currentPosition = position;
    this.setHoleCards(cards);
    this.currentPotContribution = 0;
    this.folded = false;
    this.acted = false;

    console.log(">" + this.getId(), position);
  }

  startStreet(): void {
    this.setCurrentBetSize(0);
  }

  startAct(): void {
    // RICKTODO: notify the player that he/she has started the act
  }

  placeBet(amount: number) { // placeBet() is called when the player places a bet, e.g. small blind, big blind, call, raise, all-in ,etc.
    this.updateCurrentChips(-amount);   
    this.updateCurrentBetSize(amount);
    this.currentPotContribution += amount;

    // RICKTODO: notify the player that he/she has placed a bet [RICKTODO]:
  }

  receivePotReward(amount: number): void {
    console.log(this.socket.id + ' received pot reward: ' + amount);
    this.updateCurrentChips(amount);

    // RICKTODO: notify the player that he/she has received the pot reward
  }

  showCards(): void {
    // RICKTODO: notify the player that he/she has shown the cards
  }

  // utility functions
  isStillInSng(): boolean {
    return this.getStatus() === PlayerStatus.PLAYING;
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
}
