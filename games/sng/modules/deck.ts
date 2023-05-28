import { Suits, Ranks } from './terms';

export type Card = {
  suit: Suits;
  rank: Ranks;
}

export class Deck {
  cards: Card[];

  constructor() {
    this.cards = [];
    for (let suit = 0; suit < 4; suit++) {
      for (let rank = 1; rank <= 13; rank++) {
        this.cards.push({ suit, rank });
      }
    }
  }

  shuffle(): void {
    for (let i = 0; i < this.cards.length; i++) {
      const j = Math.floor(Math.random() * this.cards.length);
      const temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }

  deal(): Card {
    if (this.cards.length === 0) {
      console.error('No more cards in the deck.');
      return { suit: -1, rank: -1 };
    } else {
      return this.cards.pop() as Card;
    }
  }

  // You don't need reset() a deck, just create a new one.
  // In the current framework, a new deck is created when a new round starts.
  // reset() {}
}
