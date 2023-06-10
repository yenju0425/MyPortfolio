export enum ServerEvents {
  connect                   = "connect",
  disconnect                = "disconnect",

  player_signup             = "player_signup",
  player_cancel_signup      = "player_cancel_signup",
  player_ready              = "player_ready",
  player_unready            = "player_unready",
  player_eliminated         = "player_eliminated",
  player_quit               = "player_quit",
  player_start_sng          = "player_start_sng",
  player_start_round        = "player_start_round",
  player_start_street       = "player_start_street",
  player_start_act          = "player_start_act",
  player_place_bet          = "player_place_bet",
  player_receive_pot_reward = "player_receive_pot_reward",
  player_show_cards         = "player_show_cards",
  deal_community_cards      = "deal_community_cards",
  deal_hole_cards           = "deal_hole_cards",

  message                   = "message", // log message from server (e.g. signup failed.)
  update_sng_room           = "update_sng_room",
}

export enum ClientEvents {
  connect                   = "connection",
  disconnect                = "disconnect",

  signup                    = "signup",
  cancel_signup             = "cancel_signup",
  ready                     = "ready",
  unready                   = "unready",
  bet                       = "bet",
  check                     = "check",
  fold                      = "fold",
  allin                     = "allin",
}
