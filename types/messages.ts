export type ServerMessageBroadcast = {
    text: string
}

export type SignupRequest = {
    id: number,
    name: string,
    email: string
}

export type SignupBroadcast = {
    id: number,
    name: string
}
