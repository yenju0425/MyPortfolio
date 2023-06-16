import { Card } from '@/games/sng/modules/deck';
import { RoomStatus, PlayerStatus } from '@/games/base/terms';

// Request: to ask the server to do something (e.g. signup, make a bet)
// Response: to respond to the client of the request (e.g. success/ fail)
// Update: to refresh some display related data (e.g. The bet size of a player has changed)

export type ServerMessage = { // This can be used for both response and broadcast
  text: string;
};

export type StandupBroadcast = {
  id: number;
};

// export type LoadRoomInfoRequest = {
// }

export type LoadRoomInfoResponse = {
  playersNames: string[];
  playersCurrentChips: number[];
  playersCurrentBetSizes: number[];
  playersCurrentStatuses: (PlayerStatus | null)[];
  roomCurrentStatus: RoomStatus;
  clientSeatId: number;
};

export type SignupRequest = {
  id: number;
  name: string;
  email: string;
};

export type SignupResponse = {
  id: number;
};

export type SignupBroadcast = { // 這個要改，從資料改變的視角（playerStatusUpdate）
  id: number;
  name: string;
};

// export type ReadyRequest = {
// }

export type ReadyResponse = {
  id: number;
};

export type ReadyBroadcast = {
  id: number;
};

export type PlayerCurrentChipsBroadcast = {
  id: number;
  playersCurrentChips: number;
};

export type PlayerCurrentBetSizeBroadcast = {
  id: number;
  currentBetSize: number;
};

export type PlayerHoleCardsBroadcast = { // This will send to the player and the spectators
  id: number;
  holeCards: Card[];
};

// export type RoomPlayBroadcast = {
// }

export type PlayerPlayBroadcast = {
  id: number;
};
