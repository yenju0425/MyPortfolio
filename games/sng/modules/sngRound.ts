import { Streets } from './terms';
import { Card, Deck } from './deck';
import { Pot } from './pots';
import { Round } from '../../base/round';
import { SngPlayer } from './sngPlayer';

// 管理每一 round 產生的資料

export class SngRound extends Round {
  private readonly dealerId: number;
  private readonly bigBlind: number;
  private readonly players: (SngPlayer | null)[];
  private communityCards: (Card | null)[];
  private deck: Deck;
  private pots: Pot[];
  private currentStreet: Streets;
  private currentPlayerId: number;
  private currentBetSize: number;

  constructor(players: (SngPlayer | null)[], dealerId: number, bigBlind: number) {
    super();
    this.dealerId = dealerId;
    this.bigBlind = bigBlind;
    this.players = players;
    this.communityCards = new Array(5).fill(null); // TODO: use constant to replace 5
    this.deck = new Deck(); // The deck needs to be shuffled after created.
    this.pots = [];
    this.currentStreet = Streets.NONE;
    this.currentPlayerId = dealerId; // Initialize the current player as the dealer.
    this.currentBetSize = 0;
  }

  // utility functions
  updatePot(): void {
    let potContribations = this.players.map((player, index) => [index, player ? player.getCurrentPotContribution() : 0]).filter(([, contribution]) => contribution > 0).sort((a, b) => a[1] - b[1]);
    for (let i = 0; potContribations.length > 0; i++) {
      this.pots[i] = {
        amount: potContribations[0][1] * potContribations.length,
        participants: potContribations.map(([index]) => index)
      };
      potContribations = potContribations.map(([index, contribution]) => [index, contribution - potContribations[0][1]]).filter(([, contribution]) => contribution > 0);
    }
  }

  // players
  initRoundPlayers(): void {
    let position = 0;
    for (let i = 0; i < this.players.length; i++) {
      let index = (this.dealerId + i) % this.players.length;
      this.players[index]?.startRound(position, this.deck);
      if (this.players[index]) {
        position++;
      }
    }
  }

  initStreetPlayers(): void {
    this.players.forEach(player => player?.startStreet());
  }

  // communityCards
  getCommunityCards(): (Card | null)[] {
    return this.communityCards;
  }

  // currentStreet
  getCurrentStreet(): Streets {
    return this.currentStreet;
  }

  // currentBetSize
  updateCurrentBetSize(amount: number): void {
    // get the max of currentBetSize and amount
    this.currentBetSize = Math.max(this.currentBetSize, amount);
  }

  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  // currentPlayerId
  getNextPlayer(): number {
    let nextPlayer = (this.currentPlayerId + 1) % this.players.length;
    while(!this.players[nextPlayer]?.isStillInStreet()) {
      nextPlayer = (nextPlayer + 1) % this.players.length
    }
    return nextPlayer;
  }

  updateCurrentPlayerId(): void {
    this.currentPlayerId = this.getNextPlayer();
  }

  resetCurrentPlayer(): void {
    this.currentPlayerId = this.dealerId;
  }

  getCurrentPlayerId(): number {
    if (this.currentPlayerId === null) {
      console.log("currentPlayerId is null, update it automatically.");
      this.updateCurrentPlayerId();
      return this.getCurrentPlayerId();
    } else {
      return this.currentPlayerId;
    }
  }
}
