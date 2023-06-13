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
