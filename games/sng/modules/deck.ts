import { Suits, Ranks, HandRankings } from './terms';

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
  // reset()

  calculateHandRanking(cards: Card[]): number {
    const suitBins: number[] = [0, 0, 0, 0]; // e.g. If there is a 3 of spades, then suitBin[Suits.SPADES] &= 0b0000000000100.
    const suitCounter: Map<Suits, number> = new Map();
    const rankCounter: Map<Ranks, number> = new Map();
    for (const card of cards) {
      suitBins[card.suit] |= (1 << card.rank);
      suitCounter.set(card.suit, (suitCounter.get(card.suit) || 0) + 1);
      rankCounter.set(card.rank, (rankCounter.get(card.rank) || 0) + 1);
    }
    //                     A        5432
    //                     v        vvvv
    let straightFilter = 0b1000000001111100000000;
    //                              ^^^^^
    //                              AKQJT = royal flush
    // 1. Royal Flush
    for (let suit of suitBins) {
      const filter = straightFilter & 0b1111111111111; // Only consider the last  13 bits.
      if ((suit & filter) === filter) {
        return parseInt((HandRankings.ROYAL_FLUSH.toString(16) + "00000"), 16); // The first digit is the hand ranking, and the rest are priority identifiers (PID).
      }
    }
    // 2. Straight Flush
    for (let i = 1; i <= 9; i++) {
      const filter = (straightFilter >> i) & 0b1111111111111; // Only consider the last 13 bits.
      for (let suit of suitBins) {
        if ((suit & filter) === filter) {
          return parseInt((HandRankings.STRAIGHT_FLUSH.toString(16) + (14 - i).toString(16).padStart(5, "0")), 16); // e.g. When i = 9, this straight will be 5432A, and the PID will be set to 5 (14 - 9).
        }
      }
    }
    const sortedSuitCounter = Array.from(suitCounter.entries()).sort((a, b) => b[1] - a[1]);
    const sortedRankCounter = Array.from(rankCounter.entries()).sort((a, b) => a[1] !== b[1] ? b[1] - a[1] : b[0] - a[0]);
    // 3. Four of a Kind
    if (sortedRankCounter[0][1] === 4) {
      return parseInt((HandRankings.FOUR_OF_A_KIND.toString(16) + sortedRankCounter[0][0].toString(16).padStart(5, "0")), 16);
    }
    // 4. Full House
    if (sortedRankCounter[0][1] === 3 && sortedRankCounter[1][1] >= 2) {
      return parseInt((HandRankings.FULL_HOUSE.toString(16) + sortedRankCounter[0][0].toString(16).padStart(5, "0")), 16);
    }
    // 5. Flush
    if (sortedSuitCounter[0][1] >= 5) {
      let PID = "";
      for (let i = Ranks.ACE; i >= Ranks.TWO; i--) {
        if ((suitBins[sortedSuitCounter[0][0]] & (1 << i)) !== 0) {
          PID += i.toString(16);
        }
      }
      return parseInt((HandRankings.FLUSH.toString(16) + PID.padStart(5, "0")), 16);
    }
    // 6. Straight
    const bin = suitBins.reduce((a, b) => a | b, 0);
    for (let i = 0; i <= 9; i++) {
      const filter = (straightFilter >> i) & 0b1111111111111; // Only consider the last 13 bits.
      if ((bin & filter) === filter) {
        return parseInt((HandRankings.STRAIGHT.toString(16) + (14 - i).toString(16).padStart(5, "0")), 16); // e.g. When i = 9, this straight will be 5432A, and the PID will be set to 5 (14 - 9).
      }
    }
    // 7. Three of a Kind
    if (sortedRankCounter[0][1] === 3) {
      return parseInt((HandRankings.THREE_OF_A_KIND.toString(16) + sortedRankCounter[0][0].toString(16).padStart(5, "0")), 16);
    }
    // 8. Two Pair
    if (sortedRankCounter[0][1] === 2 && sortedRankCounter[1][1] === 2) {
      const kicker = Array.from(rankCounter.keys()).filter(rank => rank !== sortedRankCounter[0][0] && rank !== sortedRankCounter[1][0]).sort((a, b) => b - a)[0];
      return parseInt((HandRankings.TWO_PAIR.toString(16) + (sortedRankCounter[0][0].toString(16) + sortedRankCounter[1][0].toString(16) + kicker.toString(16)).padStart(5, "0")), 16);
    }
    // 9. One Pair
    if (sortedRankCounter[0][1] === 2) {
      const kickers = Array.from(rankCounter.keys()).filter(rank => rank !== sortedRankCounter[0][0]).sort((a, b) => b - a);
      return parseInt((HandRankings.PAIR.toString(16) + (sortedRankCounter[0][0].toString(16) + kickers[0].toString(16) + kickers[1].toString(16) + kickers[2].toString(16)).padStart(5, "0")), 16);
    }
    // 10. High Card
    let PID = "";
    for (let i = 0; i < 5; i++) {
      PID += sortedRankCounter[i][0].toString(16);
    }
    return parseInt((HandRankings.HIGH_CARD.toString(16) + PID.padStart(5, "0")), 16);
  }
}
