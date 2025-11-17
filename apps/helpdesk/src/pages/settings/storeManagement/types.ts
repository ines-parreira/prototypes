import type { Integration, StoreIntegration } from 'models/integration/types'

import type { StoreMapping } from '../../../models/storeMapping/types'

export interface ChannelChange {
    channelId: number
    action: 'add' | 'remove'
}

export type StoreWithAssignedChannels = {
    store: StoreIntegration
    assignedChannels: Integration[]
}

export type StoreMappingResponse = {
    data: {
        data: StoreMapping[]
    }
}

export type ChannelTypes =
    | 'email'
    | 'chat'
    | 'helpCenter'
    | 'contactForm'
    | 'voice'
    | 'sms'
    | 'whatsApp'
    | 'facebook'
    | 'tiktokShop'

export interface ChannelWithMetadata {
    title: string
    description: string
    count: number
    type: ChannelTypes
    assignedChannels: Integration[]
    unassignedChannels: Integration[]
}
