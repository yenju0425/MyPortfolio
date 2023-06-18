import { Card } from '@/games/sng/modules/deck';
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
  roomCurrentStatus: RoomStatus;
  playersNames: string[];
  playersCurrentChips: number[];
  playersCurrentBetSizes: number[];
  playersCurrentStatuses: (PlayerStatus | null)[];
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
  betSize: number;
};

export type BetResponse = {
  seatId: number;
};

export type RaiseRequest = {
  raiseSize: number;
};

export type RaiseResponse = {
  seatId: number;
};

// export type AllinRequest = {
// };

export type AllinResponse = {
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
