import type { Prettify } from '@repo/types'

import type { Event } from '@gorgias/helpdesk-queries'

import type { TicketThreadItem } from '../types'
import { TicketThreadItemTag } from '../types'
import type {
    ActionExecutedEventSchema,
    ActionNameEventSchema,
    AuditLogEventSchema,
    DeprecatedPrivateEventSchema,
    InfluencedOrderSchema,
    PhoneEventSchema,
    PrivateReplyActionEventSchema,
    RuleExecutedTypeEventSchema,
    SatisfactionSurveyRespondedEventSchema,
    ShopifyIntegrationSchema,
    ShopifyOrderSchema,
    ShoppingAssistantEventSchema,
    SystemRuleEventSchema,
    TicketEventSchema,
} from './schemas'
import {
    actionExecutedEventSchema,
    actionNameEventSchema,
    auditLogEventSchema,
    deprecatedPrivateEventSchema,
    eventWithContextSchema,
    influencedOrderSchema,
    phoneEventSchema,
    privateReplyActionEventSchema,
    ruleExecutedEventWithContextSchema,
    ruleExecutedTypeEventSchema,
    satisfactionSurveyRespondedEventSchema,
    shopifyIntegrationSchema,
    shopifyOrderSchema,
    shoppingAssistantEventSchema,
    systemRuleEventSchema,
    ticketEventSchema,
} from './schemas'
import type { TicketThreadSingleEventItem } from './types'

type EventWithSchema<TSchema> = TSchema extends unknown
    ? Omit<Event, 'type' | 'data'> & TSchema
    : never

export function isSatisfactionSurveyRespondedEvent(
    input: unknown,
): input is Prettify<EventWithSchema<SatisfactionSurveyRespondedEventSchema>> {
    return satisfactionSurveyRespondedEventSchema.safeParse(input).success
}

export function isTicketEvent(
    input: unknown,
): input is Prettify<EventWithSchema<TicketEventSchema>> {
    return ticketEventSchema.safeParse(input).success
}

export function isPhoneEvent(
    input: unknown,
): input is Prettify<EventWithSchema<PhoneEventSchema>> {
    return phoneEventSchema.safeParse(input).success
}

export function isAuditLogEvent(
    input: unknown,
): input is EventWithSchema<AuditLogEventSchema> {
    return auditLogEventSchema.safeParse(input).success
}

export function isSystemRuleEvent(
    input: unknown,
): input is SystemRuleEventSchema {
    return systemRuleEventSchema.safeParse(input).success
}

export function isRuleExecutedType(
    input: unknown,
): input is RuleExecutedTypeEventSchema {
    return ruleExecutedTypeEventSchema.safeParse(input).success
}

export function isViaRuleEvent(
    input: unknown,
    events: readonly unknown[] = [],
): boolean {
    const parsedEvent = eventWithContextSchema.safeParse(input)

    if (!parsedEvent.success) {
        return false
    }

    return events.some((otherEvent): boolean => {
        const parsedRuleExecutedEvent =
            ruleExecutedEventWithContextSchema.safeParse(otherEvent)

        if (!parsedRuleExecutedEvent.success) {
            return false
        }

        return (
            parsedRuleExecutedEvent.data.id !== parsedEvent.data.id &&
            parsedRuleExecutedEvent.data.context === parsedEvent.data.context &&
            parsedRuleExecutedEvent.data.created_datetime <
                parsedEvent.data.created_datetime
        )
    })
}

export function isPrivateReplyActionEvent(
    input: unknown,
): input is Prettify<Event & PrivateReplyActionEventSchema> {
    return privateReplyActionEventSchema.safeParse(input).success
}

export function isActionNameEvent(
    input: unknown,
): input is Prettify<Event & ActionNameEventSchema> {
    return actionNameEventSchema.safeParse(input).success
}

export function isActionExecutedEvent(
    input: unknown,
): input is Prettify<Event & ActionExecutedEventSchema> {
    return actionExecutedEventSchema.safeParse(input).success
}

export function isDeprecatedPrivateEvent(
    input: unknown,
): input is Prettify<Event & DeprecatedPrivateEventSchema> {
    return deprecatedPrivateEventSchema.safeParse(input).success
}

export function isPrivateReplyEvent(
    input: unknown,
): input is Prettify<
    Event & PrivateReplyActionEventSchema & DeprecatedPrivateEventSchema
> {
    return isPrivateReplyActionEvent(input) && isDeprecatedPrivateEvent(input)
}

export function isNonRenderablePrivateReplyEvent(
    input: unknown,
): input is Prettify<
    Event & PrivateReplyActionEventSchema & DeprecatedPrivateEventSchema
> {
    return isPrivateReplyActionEvent(input) && !isDeprecatedPrivateEvent(input)
}

export function isShoppingAssistantEvent(
    input: unknown,
): input is ShoppingAssistantEventSchema {
    return shoppingAssistantEventSchema.safeParse(input).success
}

export function isInfluencedOrder(
    input: unknown,
): input is InfluencedOrderSchema {
    return influencedOrderSchema.safeParse(input).success
}

export function isShopifyOrder(input: unknown): input is ShopifyOrderSchema {
    return shopifyOrderSchema.safeParse(input).success
}

export function isShopifyIntegration(
    input: unknown,
): input is ShopifyIntegrationSchema {
    return shopifyIntegrationSchema.safeParse(input).success
}

export function isSingleEventItem(
    item: TicketThreadItem,
): item is TicketThreadSingleEventItem {
    switch (item._tag) {
        case TicketThreadItemTag.Events.TicketEvent:
        case TicketThreadItemTag.Events.PhoneEvent:
        case TicketThreadItemTag.Events.AuditLogEvent:
        case TicketThreadItemTag.Events.ActionExecutedEvent:
        case TicketThreadItemTag.Events.SatisfactionSurveyRespondedEvent:
        case TicketThreadItemTag.Events.PrivateReplyEvent:
        case TicketThreadItemTag.Events.ShoppingAssistantEvent:
            return true
        default:
            return false
    }
}
