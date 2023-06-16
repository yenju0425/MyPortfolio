import { Card } from '@/games/sng/modules/deck';
import { RoomStatus, PlayerStatus } from '@/games/base/terms';

export type ServerMessage = { // This can be used for both response and broadcast
  text: string;
};

export type StandupBroadcast = {
  id: number;
};

// export type LoadRoomInfoRequest = {
// }

export type LoadRoomInfoResponse = {
  names: string[];
  currentChips: number[];
  currentBetSizes: number[];
  currentPlayerStatuses: (PlayerStatus | null)[];
  currentRoomStatus: RoomStatus;
  playerId: number;
};

export type SignupRequest = {
  id: number;
  name: string;
  email: string;
};

export type SignupResponse = {
  id: number;
};

export type SignupBroadcast = {
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
  currentChips: number;
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
