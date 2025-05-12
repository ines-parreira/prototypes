export type Channel = {
    name: string
    type: string
    id: string
    address: string
}

export type Store = {
    id: string
    name: string
    url: string
    type: string
    channels: Channel[]
}
