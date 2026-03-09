import type { Prettify } from '@repo/types'

import type { Event } from '@gorgias/helpdesk-queries'

import type {
    LegacyBridgeInfluencedOrder,
    LegacyBridgeShopifyIntegration,
    LegacyBridgeShopifyOrder,
} from '../../utils/LegacyBridge'
import type { TicketThreadItemTag } from '../types'
import type {
    ActionExecutedEventSchema,
    AuditLogEventSchema,
    PhoneEventSchema,
    PrivateReplyActionEventSchema,
    SatisfactionSurveyRespondedEventSchema,
    ShoppingAssistantEventSchema,
    TicketEventSchema,
} from './schemas'

type EventWithSchema<TSchema> = TSchema extends unknown
    ? Omit<Event, 'type' | 'data'> & TSchema
    : never

export type TicketThreadTicketEventItem = {
    _tag: typeof TicketThreadItemTag.Events.TicketEvent
    data: Prettify<EventWithSchema<TicketEventSchema>>
    datetime: string
}

export type TicketThreadPhoneEventItem = {
    _tag: typeof TicketThreadItemTag.Events.PhoneEvent
    data: Prettify<EventWithSchema<PhoneEventSchema>>
    datetime: string
}

type TicketThreadAuditLogEventData = EventWithSchema<AuditLogEventSchema>

export type TicketThreadAuditLogEventItem = {
    _tag: typeof TicketThreadItemTag.Events.AuditLogEvent
    datetime: string
    meta: {
        attribution: TicketThreadAuditLogAttribution
    }
} & (TicketThreadAuditLogEventData extends infer TEvent
    ? TEvent extends TicketThreadAuditLogEventData
        ? {
              type: TEvent['type']
              data: TEvent
          }
        : never
    : never)

export type TicketThreadAuditLogEvent = TicketThreadAuditLogEventData
export type TicketThreadAuditLogEventByType<
    TType extends TicketThreadAuditLogEvent['type'],
> = Extract<TicketThreadAuditLogEventItem, { type: TType }>

export type TicketThreadAuditLogAttribution = 'none' | 'via-rule' | 'author'

export type TicketThreadSatisfactionSurveyRespondedEventItem = {
    _tag: typeof TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent
    data: Prettify<EventWithSchema<SatisfactionSurveyRespondedEventSchema>>
    datetime: string
}

export type TicketThreadPrivateReplyEventItem = {
    _tag: typeof TicketThreadItemTag.Events.PrivateReplyEvent
    data: Prettify<EventWithSchema<PrivateReplyActionEventSchema>>
    datetime: string
}

export type TicketThreadShoppingAssistantEventItem = {
    _tag: typeof TicketThreadItemTag.Events.ShoppingAssistantEvent
    data: ShoppingAssistantEventSchema
    datetime: string
}

export type TicketThreadActionExecutedEventItem = {
    _tag: typeof TicketThreadItemTag.Events.ActionExecutedEvent
    data: Prettify<EventWithSchema<ActionExecutedEventSchema>>
    datetime: string
}

export type TicketThreadSingleEventItem =
    | TicketThreadActionExecutedEventItem
    | TicketThreadTicketEventItem
    | TicketThreadPhoneEventItem
    | TicketThreadAuditLogEventItem
    | TicketThreadSatisfactionSurveyRespondedEventItem
    | TicketThreadPrivateReplyEventItem
    | TicketThreadShoppingAssistantEventItem

export type TicketThreadGroupedEventsItem = {
    _tag: typeof TicketThreadItemTag.Events.GroupedEvents
    data: TicketThreadSingleEventItem[]
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
    | TicketThreadSingleEventItem
    | TicketThreadGroupedEventsItem
