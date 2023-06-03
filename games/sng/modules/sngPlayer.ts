import { Player } from '../../base/player';
import { Card } from './deck';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../../base/terms';
import { Deck } from './deck';

export class SngPlayer extends Player {
  private currentChips: number;
  private currentPosition: number | null;
  private holeCards: Card[];
  private currentPotContribution: number;
  private isFold: boolean;
  private handRanking: number; // hexadecimal, e.g. AA335 -> 0x['3' + '00E35'] 
  private currentBetSize: number;
  private isActed: boolean; // whether the player has acted in the current street, small blind & big blind are not considered as acted

  constructor(name: string, email: string, socket: Socket) {
    super(name, email, socket);
    this.currentChips = 0; //
    this.currentPosition = null; //
    this.holeCards = []; //
    this.currentPotContribution = 0;
    this.isFold = false; //
    this.handRanking = 0;
    this.currentBetSize = 0;
    this.isActed = false;
  }

  // utility functions
  isStillInSng(): boolean {
    return this.currentStatus === PlayerStatus.PLAYING;
  }

  isStillInRound(): boolean {
    return this.isStillInSng() && !this.isFold;
  }

  isStillInStreet(): boolean {
    return this.isStillInRound() && !this.currentChips;
  }

  isAllIn(): boolean {
    return this.isStillInRound() && this.currentChips === 0;
  }

  // currentChips
  getCurrentChips(): number {
    return this.currentChips;
  }

  // currentPosition
  getCurrentPosition(): number | null {
    return this.currentPosition;
  }

  // holeCards
  getHoleCards(): Card[] {
    return this.holeCards;
  }

  // currentPotContribution
  getCurrentPotContribution(): number {
    return this.currentPotContribution;
  }

  // isFold
  fold() {
    this.isFold = true;
  }

  resetIsFold() {
    this.isFold = false;
  }

  getIsFold(): boolean {
    return this.isFold;
  }

  // handRanking
  setHandRanking(handRanking: number): void {
    this.handRanking = handRanking;
  }

  getHandRanking(): number {
    return this.handRanking;
  }

  // currentBetSize
  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  // isActed
  act(): void { // act() is called when the player acts in the current street, e.g. call, raise, all-in, etc.
    this.isActed = true;
  }

  resetIsActed(): void {
    this.isActed = false;
  }

  getIsActed(): boolean {
    return this.isActed;
  }

  // player functions
  startSng(initialChips: number): void {
    this.play();
    this.currentChips = initialChips;

    // RICKTODO: notify the player that he/she has started the game
  }

  startRound(position: number, deck: Deck): void {
    this.currentPosition = position;
    this.holeCards = [deck.deal(), deck.deal()];
    this.currentPotContribution = 0;
    this.isFold = false;
    this.isActed = false;

    // RICKTODO: notify the player that he/she has started the round
  }

  startStreet(): void {
    this.currentBetSize = 0;

    // RICKTODO: notify the player that he/she has started the street
  }

  startAct(): void {
    // RICKTODO: notify the player that he/she has started the act
  }

  placeBet(amount: number) { // placeBet() is called when the player places a bet, e.g. small blind, big blind, call, raise, all-in ,etc.
    this.currentBetSize += amount;
    this.currentPotContribution += amount;

    // RICKTODO: notify the player that he/she has placed a bet
  }

  receivePotReward(amount: number): void {
    this.currentChips += amount;

    // RICKTODO: notify the player that he/she has received the pot reward
  }

  showCards(): void {
    // RICKTODO: notify the player that he/she has shown the cards
  }
}

// 所有需要通知前端的動作
// 1. 玩家報名 (P, O, A)
// 2. 玩家取消報名 (P, O, A)
// 3. 玩家準備 (P, O, A)
// 4. 玩家取消準備 (P, O, A)
// 5. 發牌 (P, A) <---------------
// 6. 等待玩家下注 (P, O, A)
// 7. 通知玩家行動 (P) <-----------
// 7. 玩家下注 (P, O, A)
// 8. 發獎 (P, O, A)
// 9. 結束遊戲 (P, O, A)
// 9. 玩家離開 (P, O, A)
