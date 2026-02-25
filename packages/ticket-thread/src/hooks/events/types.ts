import type { Prettify } from '@repo/types'

import type { Event } from '@gorgias/helpdesk-queries'

import type {
    LegacyBridgeInfluencedOrder,
    LegacyBridgeShopifyIntegration,
    LegacyBridgeShopifyOrder,
} from '../../utils/LegacyBridge'
import type { TicketThreadItemTag } from '../types'
import type {
    AuditLogEventSchema,
    PhoneEventSchema,
    PrivateReplyActionEventSchema,
    SatisfactionSurveyRespondedEventSchema,
    ShoppingAssistantEventSchema,
    TicketEventSchema,
} from './schemas'

export type TicketThreadTicketEventItem = {
    _tag: typeof TicketThreadItemTag.Events.TicketEvent
    data: Prettify<Event & TicketEventSchema>
    datetime: string
}

export type TicketThreadPhoneEventItem = {
    _tag: typeof TicketThreadItemTag.Events.PhoneEvent
    data: Prettify<Event & PhoneEventSchema>
    datetime: string
}

export type TicketThreadAuditLogEventItem = {
    _tag: typeof TicketThreadItemTag.Events.AuditLogEvent
    data: Prettify<Event & AuditLogEventSchema>
    datetime: string
}

export type TicketThreadSatisfactionSurveyRespondedEventItem = {
    _tag: typeof TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent
    data: Prettify<Event & SatisfactionSurveyRespondedEventSchema>
    datetime: string
}

export type TicketThreadPrivateReplyEventItem = {
    _tag: typeof TicketThreadItemTag.Events.PrivateReplyEvent
    data: Prettify<Event & PrivateReplyActionEventSchema>
    datetime: string
}

export type TicketThreadShoppingAssistantEventItem = {
    _tag: typeof TicketThreadItemTag.Events.ShoppingAssistantEvent
    data: ShoppingAssistantEventSchema
    datetime: string
}

export type TicketThreadEventSource = Event | ShoppingAssistantEventSchema

export type TicketThreadShoppingAssistantEventSources = {
    ticketId: number
    influencedOrders?: LegacyBridgeInfluencedOrder[]
    shopifyOrders?: LegacyBridgeShopifyOrder[]
    shopifyIntegrations?: LegacyBridgeShopifyIntegration[]
}

export type TicketThreadEventItem =
    | TicketThreadTicketEventItem
    | TicketThreadPhoneEventItem
    | TicketThreadAuditLogEventItem
    | TicketThreadSatisfactionSurveyRespondedEventItem
    | TicketThreadPrivateReplyEventItem
    | TicketThreadShoppingAssistantEventItem
