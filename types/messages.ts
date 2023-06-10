export type ServerMessageBroadcast = {
    text: string
}

export type SignupRequest = {
    id: number,
    name: string,
    email: string
}

export type SignupResponse = {
    id: number
}

export type SignupBroadcast = {
    id: number,
    name: string
}
