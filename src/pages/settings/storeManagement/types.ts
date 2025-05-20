import { Integration, StoreIntegration } from 'models/integration/types'

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

export interface ChannelChange {
    channelId: number
    action: 'add' | 'remove'
}

export type StoreWithAssignedChannels = {
    store: StoreIntegration
    assignedChannels: Integration[]
}
