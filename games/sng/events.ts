export enum ServerEvents {
  connect                   = "connection", // Built in

  client_disconnect         = "client_disconnect",


}

export enum ClientEvents {
  connect                   = "connect", // Built in

  // actions before the game
  signup                    = "signup",
  cancel_signup             = "cancel_signup",
  ready                     = "ready",
  unready                   = "unready",

  // actions during the game
  fold                      = "fold",
  check                     = "check",
  call                      = "call",
  bet                       = "bet",
  raise                     = "raise",
}
