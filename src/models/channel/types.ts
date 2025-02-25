import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'

export type Channel = {
    id: string
    name: string
    slug: ChannelIdentifier
    logo_url: string | null
    live_messaging: boolean
    created_datetime: string
    updated_datetime: string | null
}

export type LegacyChannel = Channel & { slug: TicketChannel }

export type ChannelLike = Channel | ChannelIdentifier
export type ChannelIdentifier = TicketChannel | TicketMessageSourceType | string
