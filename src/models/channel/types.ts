import {IntegrationType} from 'models/integration/constants'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

export type Channel = {
    id: string
    name: string
    slug: string
    logo_url: string | null
    live_messaging: boolean
    created_datetime: string
    updated_datetime: string | null
}

export type LegacyChannel = Channel & {type: IntegrationType}

export type ChannelLike =
    | Channel
    | TicketMessageSourceType
    | TicketChannel
    | IntegrationType
    | string
