import { Card } from '@/games/sng/modules/deck';
import { RoomStatus, PlayerStatus } from '../games/base/terms';

export type ServerMessageBroadcast = {
  text: string
}

export type StandupBroadcast = { // when a player cancels signup, quit, eliminated, or disconnected
  id: number
}

// export type LoadRoomInfoRequest = {
// }

export type LoadRoomInfoResponse = {
  names: string[],
  currentChips: number[],
  currentBetSizes: number[],
  currentPlayerStatuses: (PlayerStatus | null)[],
  currentRoomStatus: RoomStatus,
  playerId: number,
}

// Signup
export type SignupRequest = {
  id: number,
  name: string,
  email: string
}

export type SignupResponse = {
  id: number,
}

export type SignupBroadcast = {
  id: number,
  name: string
}

// Ready
// export type ReadyRequest = {
// }

export type ReadyResponse = {
  id: number,
}

export type ReadyBroadcast = {
  id: number
}

// SNG play
// export type RoomPlayBroadcast = {
// }

// Player play
export type PlayerPlayBroadcast = {
  id: number,
}

export type PlayerCurrentChipsBroadcast = {
  id: number,
  currentChips: number,
}

export type PlayerCurrentBetSizeBroadcast = {
  id: number,
  currentBetSize: number,
}

export type PlayerHoleCardsResponse = { // This will send to the player and the spectators
  id: number,
  holeCards: Card[]
}

