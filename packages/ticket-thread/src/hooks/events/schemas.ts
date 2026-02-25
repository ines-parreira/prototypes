import { z } from 'zod'

import {
    AUDIT_LOG_EVENT_TYPES,
    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    InfluencedOrderSource,
    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
    PHONE_EVENTS,
    PRIVATE_REPLY_ACTIONS,
    SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
} from './constants'

export const ticketEventSchema = z.object({
    object_type: z.string(),
    type: z.string(),
})
export type TicketEventSchema = z.infer<typeof ticketEventSchema>

export const phoneEventSchema = ticketEventSchema.extend({
    type: z.enum(PHONE_EVENTS),
})
export type PhoneEventSchema = z.infer<typeof phoneEventSchema>

export const auditLogEventSchema = ticketEventSchema.extend({
    type: z.enum(AUDIT_LOG_EVENT_TYPES),
})
export type AuditLogEventSchema = z.infer<typeof auditLogEventSchema>

export const privateReplyActionEventSchema = ticketEventSchema.extend({
    data: z.object({
        action_name: z.enum(PRIVATE_REPLY_ACTIONS),
    }),
})
export type PrivateReplyActionEventSchema = z.infer<
    typeof privateReplyActionEventSchema
>

export const actionNameEventSchema = ticketEventSchema.extend({
    data: z.object({
        action_name: z.string(),
    }),
})
export type ActionNameEventSchema = z.infer<typeof actionNameEventSchema>

export const messagingDeprecatedPrivateEventSchema = ticketEventSchema.extend({
    data: z
        .object({
            payload: z.object({
                private_reply_event_type: z.literal(
                    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
                ),
            }),
            facebook_comment_ticket_id: z.string().optional(),
            instagram_comment_ticket_id: z.string().optional(),
        })
        .refine(
            (data) =>
                !!data.facebook_comment_ticket_id ||
                !!data.instagram_comment_ticket_id,
        ),
})

export const commentDeprecatedPrivateEventSchema = ticketEventSchema.extend({
    data: z
        .object({
            payload: z.object({
                private_reply_event_type: z.literal(
                    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
                ),
            }),
            messenger_ticket_id: z.string().optional(),
            instagram_direct_message_ticket_id: z.string().optional(),
        })
        .refine(
            (data) =>
                !!data.messenger_ticket_id ||
                !!data.instagram_direct_message_ticket_id,
        ),
})

export const deprecatedPrivateEventSchema = z.union([
    messagingDeprecatedPrivateEventSchema,
    commentDeprecatedPrivateEventSchema,
])

export type DeprecatedPrivateEventSchema = z.infer<
    typeof deprecatedPrivateEventSchema
>

export const shoppingAssistantEventSchema = z.object({
    orderId: z.number(),
    orderNumber: z.number(),
    shopName: z.string(),
    created_datetime: z.string(),
    influencedBy: z.nativeEnum(InfluencedOrderSource),
})
export type ShoppingAssistantEventSchema = z.infer<
    typeof shoppingAssistantEventSchema
>

export const influencedOrderSchema = z.object({
    id: z.number(),
    integrationId: z.number(),
    ticketId: z.number(),
    createdDatetime: z.string(),
    source: z.string().nullable().optional(),
})
export type InfluencedOrderSchema = z.infer<typeof influencedOrderSchema>

export const shopifyOrderSchema = z.object({
    id: z.number(),
    order_number: z.number(),
})
export type ShopifyOrderSchema = z.infer<typeof shopifyOrderSchema>

export const shopifyIntegrationSchema = z.object({
    id: z.number(),
    name: z.string(),
})
export type ShopifyIntegrationSchema = z.infer<typeof shopifyIntegrationSchema>

export const satisfactionSurveyRespondedEventSchema = ticketEventSchema.extend({
    type: z.literal(SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE),
})
export type SatisfactionSurveyRespondedEventSchema = z.infer<
    typeof satisfactionSurveyRespondedEventSchema
>
