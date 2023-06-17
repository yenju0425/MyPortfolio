import { Round } from '@/games/base/round';
import { Card, Deck } from './deck';
import { Pot } from './pots';
import { Streets } from './terms';
import { SngPlayer } from './sngPlayer';

export class SngRound extends Round {
  private readonly endRoundCallback: () => void;
  private readonly bigBlindSeatId: number;
  private readonly bigBlind: number;
  private readonly players: (SngPlayer | null)[];
  private communityCards: Card[];
  private deck: Deck;
  private pots: Pot[];
  private currentStreet: Streets;
  private currentPlayerSeatId: number;
  private currentBetSize: number;

  constructor(endRoundCallback: () => void, players: (SngPlayer | null)[], bigBlindSeatId: number, bigBlind: number) {
    super();
    this.endRoundCallback = endRoundCallback;
    this.bigBlindSeatId = bigBlindSeatId;
    this.bigBlind = bigBlind;
    this.players = players;
    this.communityCards = [];
    this.deck = new Deck(); // The deck needs to be shuffled after created.
    this.pots = [];
    this.currentStreet = Streets.NONE;
    this.currentPlayerSeatId = bigBlindSeatId; // Initialize the current player as the bmallBlind.
    this.currentBetSize = 0;
  }

  // bigBlindSeatId
  getBigBlindSeatId(): number {
    return this.bigBlindSeatId;
  }

  // bigBlind
  getBigBlind(): number {
    return this.bigBlind;
  }

  // players
  getPlayer(): SngPlayer | null {
    return this.players[this.currentPlayerSeatId];
  }
    
  // communityCards
  getCommunityCards(): Card[] {
    return this.communityCards;
  }

  // deck
  getDeck(): Deck {
    return this.deck;
  }

  // Pots
  getPots(): Pot[] {
    return this.pots;
  }

  setPots(pots: Pot[]): void {
    this.pots = pots;
  }

  updatePots(): void {
    const newPots: Pot[] = [];
    let potContribations = this.players.map((player, index) => [index, player?.getCurrentPotContribution() || 0]).filter(([, contribution]) => contribution > 0).sort((a, b) => a[1] - b[1]);
    for (let i = 0; potContribations.length > 0; i++) {
      newPots.push({
        amount: potContribations[0][1] * potContribations.length,
        participants: potContribations.map(([index]) => index)
      });
      potContribations = potContribations.map(([index, contribution]) => [index, contribution - potContribations[0][1]]).filter(([, contribution]) => contribution > 0);
    }

    this.setPots(newPots);
  }

  // currentStreet
  getCurrentStreet(): Streets {
    return this.currentStreet;
  }

  setCurrentStreet(street: Streets): void {
    this.currentStreet = street;
  }

  updateCurrentStreet(): void {
    this.setCurrentStreet(this.getCurrentStreet() + 1);
  }

  // currentBetSize
  getCurrentBetSize(): number {
    return this.currentBetSize;
  }

  setCurrentBetSize(amount: number): void {
    this.currentBetSize = amount;
  }

  updateCurrentBetSize(amount: number): void {
    this.setCurrentBetSize(Math.max(this.getCurrentBetSize(), amount));
  }

  // currentPlayerSeatId
  getCurrentPlayerSeatId(): number {
    if (this.currentPlayerSeatId === null) {
      console.log("currentPlayerSeatId is null, update it automatically.");
      this.updateCurrentPlayerSeatId();
      return this.getCurrentPlayerSeatId();
    } else {
      return this.currentPlayerSeatId;
    }
  }

  setCurrentPlayerSeatId(seatId: number): void {
    this.currentPlayerSeatId = seatId;
  }

  updateCurrentPlayerSeatId(): void {
    let nextPlayerSeatId = (this.currentPlayerSeatId + 1) % this.players.length;
    while(!this.players[nextPlayerSeatId]?.isStillInStreet()) {
      nextPlayerSeatId = (nextPlayerSeatId + 1) % this.players.length
    }
    this.setCurrentPlayerSeatId(nextPlayerSeatId);
  }

  resetCurrentPlayerSeatId(): void {
    this.setCurrentPlayerSeatId(this.getBigBlindSeatId());
  }

  // round functions
  startStreet(): void {
    console.log('[RICKDEBUG] startStreet');

    // this.get [RICKTODO]: next street
    this.updateCurrentStreet();

    // Initialize players in the street.
    this.initStreetPlayers();
  
    // Start the first action.
    this.startAction();
  }

  startAction(): void {

    // Update current player seat id.
    this.updateCurrentPlayerSeatId();

    // Get current player.
    const currentPlayer = this.getPlayer();
    if (!currentPlayer) {
      console.error('currentPlayer is null');
      this.endAction();
      return;
    }

    console.log('[RICKDEBUG] startAction', this.getCurrentPlayerSeatId(), currentPlayer.getCurrentPosition());
    
    // Automatically place bet for small blind and big blind.
    if (this.getCurrentStreet() === Streets.PREFLOP) {
      if (currentPlayer?.getCurrentPosition() === 1 && !currentPlayer.getCurrentBetSize()) { // small blind
        console.log('player: ' + currentPlayer?.getName() + ' is small blind');
        currentPlayer.placeBet(this.bigBlind / 2);
        this.endAction();
        return;
      } else if (currentPlayer?.getCurrentPosition() === 2 && !currentPlayer.getCurrentBetSize()) { // big blind
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
    this.updatePots();

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

  // utility functions
  isAllPlayersActed(): boolean {
    return this.players.filter(player => player !== null).every(player => player?.isActed());
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

  calculatePlayersHandRanking(): void {
    for (let player of this.players) {
      let cards = player?.getHoleCards().concat(this.getCommunityCards()).filter(card => card !== null) || [];
      player?.setHandRanking(this.getDeck().calculateHandRanking(cards));
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

  initRoundPlayers(): void {
    let position = 2; // 0: dealer, 1: small blind, 2: big blind
    for (let i = 0; i < this.players.length; i++) {
      let index = (this.bigBlindSeatId - i + this.players.length) % this.players.length;

      console.log(index, position);
      this.players[index]?.startRound(position, [this.getDeck().deal(), this.getDeck().deal()]);
      if (this.players[index]) {
        position = (position - 1 + this.players.length) % this.players.length; // If there are 2 players, small blind will be the dealer.
      }
    }
  }

  initStreetPlayers(): void {
    this.players.forEach(player => player?.startStreet());
  }
}
