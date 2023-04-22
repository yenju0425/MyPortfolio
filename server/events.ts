export enum socketEvent {
  // Built in
  connect         = "connect",
  disconnect      = "disconnect",

  // Game
  create_room     = "create_room",
  join_room       = "join_room",
  joined_room     = "joined_room",
  leave_room      = "leave_room",
  left_room       = "left_room",
  game_update     = "game_update",
  room_broadcast  = "room_broadcast",
  connected_user  = "connected_user",
  select_region   = "select_region",

  // Errors
  error_lobby_does_not_exist = "error_lobby_does_not_exist",
  error_lobby_already_exists = "error_lobby_already_exists",
  error_lobby_full = "error_lobby_full",
  error_lobby_not_full = "error_lobby_not_full",
  lobby_timeout = "lobby_timeout",

  // Testing
  update_server_number = "update_server_number",
  update_client_number = "update_client_number",
}