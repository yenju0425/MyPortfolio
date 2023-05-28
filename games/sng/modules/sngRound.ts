import { Streets } from './terms';
import { Card, Deck } from './deck';
import { Pot } from './pot';
import { Round } from '../../base/round';
import { SngPlayer } from './sngPlayer';

export class SngRound extends Round {
  private communityCards: (Card | null)[];
  private deck: Deck;
  private currentPot: Pot;
  private currentStreet: Streets;
  private currentBetSize: number;

  constructor() {
    super();
    this.communityCards = new Array(5).fill(null); // TODO: use constant to replace 5
    this.deck = new Deck(); // The deck needs to be shuffled after created.
    this.currentPot = new Pot();
    this.currentStreet = Streets.NONE;
    this.currentBetSize = 0;
  }

  getCommunityCards(): (Card | null)[] {
    return this.communityCards;
  }

  // deck
  getDeck(): Deck {
    return this.deck;
  }

  // pot
  getCurrentPot(): Pot {
    return this.currentPot;
  }

  // currentStreet
  getCurrentStreet(): Streets {
    return this.currentStreet;
  }

  // currentBetSize
  getCurrentBetSize(): number {
    return this.currentBetSize;
  }
}
