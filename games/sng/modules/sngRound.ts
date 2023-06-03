import { Streets } from './terms';
import { Card, Deck } from './deck';
import { Pot } from './pots';
import { Round } from '../../base/round';
import { SngPlayer } from './sngPlayer';
import { Suits, Ranks, HandRankings } from './terms';

// 管理每一 round 產生的資料

export class SngRound extends Round {
  private readonly endRoundCallback: () => void;
  private readonly dealerId: number;
  private readonly bigBlind: number;
  private readonly players: (SngPlayer | null)[];
  private communityCards: Card[];
  private deck: Deck;
  private pots: Pot[];
  private currentStreet: Streets;
  private currentPlayerId: number;
  private currentBetSize: number;

  constructor(endRoundCallback: () => void, players: (SngPlayer | null)[], dealerId: number, bigBlind: number) {
    super();
    this.endRoundCallback = endRoundCallback;
    this.dealerId = dealerId;
    this.bigBlind = bigBlind;
    this.players = players;
    this.communityCards = [];
    this.deck = new Deck(); // The deck needs to be shuffled after created.
    this.pots = [];
    this.currentStreet = Streets.NONE;
    this.currentPlayerId = dealerId; // Initialize the current player as the dealer.
    this.currentBetSize = 0;
  }

  // utility functions
  isAllPlayersActed(): boolean {
    return this.players.filter(player => player !== null).every(player => player?.getIsActed());
  }

  isBetConsensusReached(): boolean {
    return this.players.filter(player => player !== null && player?.isStillInStreet()).every(player => player?.getCurrentBetSize() === this.getCurrentBetSize() || player?.isAllIn());
  }

  getNumOfPlayersStillInRound(): number {
    return this.players.filter(player => player?.isStillInRound()).length;
  }

  getNumOfPlayersStillInStreet(): number {
    return this.players.filter(player => player?.isStillInStreet()).length;
  }

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

  calculatePlayersHandRanking(): void {
    for (let player of this.players) {
      let cards = player?.getHoleCards().concat(this.getCommunityCards()).filter(card => card !== null) || [];
      player?.setHandRanking(this.calculateHandRanking(cards));
    }
  }

  getActivePotParticipants(pot: Pot): number[] { // Filter out the participants who already folded or quit.
    return pot.participants.filter(participantId => this.players[participantId]?.isStillInRound());
  }

  getPotWinnerIds(pot: Pot): number[] {
    let winners: number[] = [];
    let maxHandRanking = 0;
    for (let participantId of this.getActivePotParticipants(pot)) {
      const handRanking = this.players[participantId]?.getHandRanking() || -1;
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
    for (let i = 0; i < this.pots.length; i++) {
      const numOfActivePotParticipants = this.getActivePotParticipants(this.pots[i]).length;
      const getPotWinnerIds = this.getPotWinnerIds(this.pots[i]);
      const rewardAmount = Math.floor(this.pots[i].amount / getPotWinnerIds.length); // Math.floor is used to ensure the reward amount is an integer.
      for (let winnerId of getPotWinnerIds) {
        this.players[winnerId]?.receivePotReward(rewardAmount);
        if (numOfActivePotParticipants > 1) { // The winner needs to show the cards if there are more than one active participants in the pot.
          this.players[winnerId]?.showCards();
        }
      }
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

  getPlayer(): SngPlayer | null {
    return this.players[this.currentPlayerId];
  }
    
  // communityCards
  getCommunityCards(): Card[] {
    return this.communityCards;
  }

  // Pots
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
  getNextPlayerId(): number {
    let nextPlayerId = (this.currentPlayerId + 1) % this.players.length;
    while(!this.players[nextPlayerId]?.isStillInStreet()) {
      nextPlayerId = (nextPlayerId + 1) % this.players.length
    }
    return nextPlayerId;
  }

  updateCurrentPlayerId(): void {
    this.currentPlayerId = this.getNextPlayerId();
  }

  resetCurrentPlayerId(): void {
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

  // round functions
  startStreet(): void {
    // Initialize players in the street.
    this.initStreetPlayers();
  
    // Start the first action.
    this.startAction();
  }

  startAction(): void {
    // Update current player id.
    this.updateCurrentPlayerId();

    // Get current player.
    const currentPlayer = this.getPlayer();
    if (!currentPlayer) {
      console.error('currentPlayer is null');
      this.endAction();
      return;
    }

    // Automatically place bet for small blind and big blind.
    if (this.getCurrentStreet() === Streets.PREFLOP) {
      if (currentPlayer?.getCurrentPosition() === 1) { // small blind
        console.log('player: ' + currentPlayer?.getName() + ' is small blind');
        currentPlayer.placeBet(this.bigBlind / 2);
        this.endAction();
        return;
      } else if (currentPlayer?.getCurrentPosition() === 2) { // big blind
        console.log('player: ' + currentPlayer?.getName() + ' is big blind');
        currentPlayer.placeBet(this.bigBlind);
        this.endAction();
        return;
      }
    }
    // TODO: Send message to the client to ask for action.
  }

  endAction(): void {
    if (this.getNumOfPlayersStillInStreet() < 2) {
      this.endStreet();
    } else if (this.isAllPlayersActed() && this.isBetConsensusReached()) {
      this.endStreet();
    } else {
      this.startAction();
    }
  }

  endStreet(): void {
    this.updatePot();

    // TODO: return the overbet chips to the player

    if (this.getNumOfPlayersStillInRound() < 2) {
      this.rewardPotsToWinners();
      this.endRoundCallback();
    } else if (this.getCurrentStreet() === Streets.RIVER) {
      this.calculatePlayersHandRanking();
      this.rewardPotsToWinners();
      this.endRoundCallback();
    } else {
      this.startStreet();
    }
  }
}
