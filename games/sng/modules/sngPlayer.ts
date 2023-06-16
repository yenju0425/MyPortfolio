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
  private isFold: boolean;
  private handRanking: number; // hexadecimal, e.g. AA335 -> 0x['3' + '00E35']
  // street
  private currentBetSize: number; // displayed in the frontend
  private isActed: boolean; // whether the player has acted in the current street, small blind & big blind are not considered as acted

  constructor(id: number, name: string, email: string, socket: Socket, io: Server) {
    super(id, name, email, socket, io);
    // sng
    this.currentChips = 0;
    // round
    this.currentPosition = null;
    this.holeCards = [];
    this.currentPotContribution = 0;
    this.isFold = false;
    this.handRanking = 0;
    // street
    this.currentBetSize = 0;
    this.isActed = false;
  }

  // utility functions
  isStillInSng(): boolean {
    return this.getStatus() === PlayerStatus.PLAYING;
  }

  isStillInRound(): boolean {
    return this.isStillInSng() && !this.isFold;
  }

  isStillInStreet(): boolean {
    return this.isStillInRound() && this.currentChips > 0;
  }

  isAllIn(): boolean {
    return this.isStillInRound() && this.currentChips === 0;
  }

  // currentChips
  broadcastCurrentChips(): void {
    const broadcast: Msg.PlayerCurrentChipsUpdateBraodcast = {
      seatId: this.getId(),
      playerCurrentChips: this.getCurrentChips()
    };
    this.io.emit('PlayerCurrentChipsUpdateBraodcast', broadcast);
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

  setCurrentBetSize(chips: number): void {
    this.currentBetSize = chips;

    // BroadCast to all players to update
    this.socket.emit('PlayerCurrentBetSizeBroadcast', { id: this.getId(), currentBetSize: this.getCurrentBetSize() }); // to the player himself
    this.socket.broadcast.emit('PlayerCurrentBetSizeBroadcast', { id: this.getId(), currentBetSize: this.getCurrentBetSize() }); // to other players
  }

  updateCurrentBetSize(chips: number): void {
    this.currentBetSize += chips;

    // BroadCast to all players to update
    this.socket.emit('PlayerCurrentBetSizeBroadcast', { id: this.getId(), currentBetSize: this.getCurrentBetSize() }); // to the player himself
    this.socket.broadcast.emit('PlayerCurrentBetSizeBroadcast', { id: this.getId(), currentBetSize: this.getCurrentBetSize() }); // to other players
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
    this.setCurrentChips(initialChips);

    console.log(this.socket.id + ' started the game, status: ' + this.currentStatus + ', chips: ' + this.currentChips);
  }

  startRound(position: number, cards: Card[]): void {
    this.currentPosition = position;
    this.holeCards = cards;
    this.currentPotContribution = 0;
    this.isFold = false;
    this.isActed = false;

    console.log(">" + this.getId(), position);

    // RICKTODO: 最好還是用 datadriven 的寫法，傳給前端的協議表示資料有異動
    this.socket.emit('PlayerHoleCardsBroadcast', { id: this.getId(), holeCards: this.getHoleCards() }); // to the player himself

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
