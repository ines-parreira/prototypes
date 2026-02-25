import type { Prettify } from '@repo/types'

import type { Event } from '@gorgias/helpdesk-queries'

import type {
    ActionNameEventSchema,
    AuditLogEventSchema,
    DeprecatedPrivateEventSchema,
    InfluencedOrderSchema,
    PhoneEventSchema,
    PrivateReplyActionEventSchema,
    SatisfactionSurveyRespondedEventSchema,
    ShopifyIntegrationSchema,
    ShopifyOrderSchema,
    ShoppingAssistantEventSchema,
    TicketEventSchema,
} from './schemas'
import {
    actionNameEventSchema,
    auditLogEventSchema,
    deprecatedPrivateEventSchema,
    influencedOrderSchema,
    phoneEventSchema,
    privateReplyActionEventSchema,
    satisfactionSurveyRespondedEventSchema,
    shopifyIntegrationSchema,
    shopifyOrderSchema,
    shoppingAssistantEventSchema,
    ticketEventSchema,
} from './schemas'

export function isSatisfactionSurveyRespondedEvent(
    input: unknown,
): input is Prettify<Event & SatisfactionSurveyRespondedEventSchema> {
    return satisfactionSurveyRespondedEventSchema.safeParse(input).success
}

export function isTicketEvent(
    input: unknown,
): input is Prettify<Event & TicketEventSchema> {
    return ticketEventSchema.safeParse(input).success
}

export function isPhoneEvent(
    input: unknown,
): input is Prettify<Event & PhoneEventSchema> {
    return phoneEventSchema.safeParse(input).success
}

export function isAuditLogEvent(
    input: unknown,
): input is Prettify<Event & AuditLogEventSchema> {
    return auditLogEventSchema.safeParse(input).success
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
