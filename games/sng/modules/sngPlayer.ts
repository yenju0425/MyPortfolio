import { Player } from '../../base/player';
import { Card } from './deck';
import { Socket } from 'socket.io';
import { PlayerStatus } from '../../base/terms';
import { Deck } from './deck';

export class SngPlayer extends Player {
  private currentChips: number;
  private currentPosition: number | null;
  private holeCards: (Card | null)[];
  private currentPotContribution: number;
  private isFold: boolean;
  private currentBetSize: number;
  private isActed: boolean; // whether the player has acted in the current street, small blind & big blind are not considered as acted

  constructor(name: string, email: string, socket: Socket) {
    super(name, email, socket);
    this.currentChips = 0;
    this.currentPosition = null;
    this.holeCards = [null, null];
    this.currentPotContribution = 0;
    this.isFold = false;
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

  startSng(initialChips: number): void {
    this.play();
    this.currentChips = initialChips;
  }

  startRound(position: number, deck: Deck): void {
    this.currentPosition = position;
    this.holeCards = [deck.deal(), deck.deal()];
    this.currentPotContribution = 0;
    this.isFold = false;
    this.isActed = false;
  }

  startStreet(): void {
    this.currentBetSize = 0;
  }

  placeBet(amount: number) {
    this.currentBetSize += amount;
    this.currentPotContribution += amount;
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
  getHoleCards(): (Card | null)[] {
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

  // currentBetSize
  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  // isActed
  act(): void {
    this.isActed = true;
  }

  resetIsActed(): void {
    this.isActed = false;
  }

  getIsActed(): boolean {
    return this.isActed;
  }

}
