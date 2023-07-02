import { Card } from '@/games/sng/modules/deck';
import { Pot } from '@/games/sng/modules/pot';
import { RoomStatus, PlayerStatus } from '@/games/base/terms';

// Request: to ask the server to do something (e.g. signup, make a bet)
// Response: to respond to the client of the request (e.g. success/ fail)
// Update: to refresh some display related data (e.g. The bet size of a player has changed)

export type ServerMessageBroadcast = { // log some server message, e.g. error message
  text: string;
};

export type StandupBroadcast = {
  seatId: number;
};

// export type LoadRoomInfoRequest = {
// };

export type LoadRoomInfoResponse = {
  clientSeatId: number;
  currentPlayerSeatId: number; // -1 if the game has not started
  roomCurrentBetSize: number;
  roomCurrentMinRaise: number;
  roomCurrentStatus: RoomStatus;
  playersNames: string[];
  playersCurrentChips: number[];
  playersCurrentBetSizes: number[];
  playersCurrentStatuses: (PlayerStatus | null)[]; // null if the seat is empty
  playersHoleCards: Card[][]; // [] if the game has not started, null if the seat is empty
  communityCards: Card[]; // [] if the game has not started
  pots: Pot[]; // [] if the game has not started
};

export type SignupRequest = {
  seatId: number;
  name: string;
  email: string;
};

export type SignupResponse = {
  seatId: number;
};

export type SignupBroadcast = { // used to initialize a new player
  seatId: number;
  name: string;
};

// export type ReadyRequest = {
// };

export type ReadyResponse = {
  seatId: number;
};

// export type FoldRequest = {
// };

export type FoldResponse = {
  seatId: number;
};

// export type CheckRequest = {
// };

export type CheckResponse = {
  seatId: number;
};

// export type CallRequest = {
// };

export type CallResponse = {
  seatId: number;
};

export type BetRequest = {
  betAmount: number;
};

export type BetResponse = {
  seatId: number;
};

export type RaiseRequest = {
  raiseAmount: number;
};

export type RaiseResponse = {
  seatId: number;
};

// export type AllInRequest = {
// };

export type AllInResponse = {
  seatId: number;
};

// updates
export type ClientSeatIdUpdateBroadcast = {
  clientSeatId: number;
};

export type CurrentPlayerSeatIdUpdateBroadcast = {
  currentPlayerSeatId: number;
};

export type RoomCurrentBetSizeUpdateBroadcast = {
  roomCurrentBetSize: number;
};

export type RoomCurrentMinRaiseUpdateBroadcast = {
  roomCurrentMinRaise: number;
};

export type RoomCurrentStatusUpdateBroadcast = {
  roomCurrentStatus: RoomStatus;
};

export type PlayerNameUpdateBroadcast = {
  seatId: number;
  playerName: string;
};

export type PlayerCurrentChipsUpdateBroadcast = {
  seatId: number;
  playerCurrentChips: number;
};

export type PlayerCurrentBetSizeUpdateBroadcast = {
  seatId: number;
  playerCurrentBetSize: number;
};

export type PlayerCurrentStatusUpdateBroadcast = {
  seatId: number;
  playerCurrentStatus: PlayerStatus;
};

export type PlayerHoleCardsUpdateBroadcast = {
  seatId: number;
  playerHoleCards: Card[];
};

export type CommunityCardsUpdateBroadcast = {
  communityCards: Card[];
};

export type PotsUpdateBroadcast = {
  pots: Pot[];
};
