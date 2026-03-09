import { z } from 'zod'

import type { AUDIT_LOG_EVENT_TYPES } from './constants'
import {
    ACTION_EXECUTED_EVENT_TYPE,
    COMMENT_TICKET_PRIVATE_REPLY_EVENT,
    InfluencedOrderSource,
    MESSAGING_TICKET_PRIVATE_REPLY_EVENT,
    PHONE_EVENTS,
    PRIVATE_REPLY_ACTIONS,
    RENDERABLE_ACTION_EXECUTED_ACTIONS,
    SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE,
    SYSTEM_RULE_TYPE,
} from './constants'

export const ticketEventSchema = z.object({
    object_type: z.string(),
    type: z.string(),
})
export type TicketEventSchema = z.infer<typeof ticketEventSchema>

const eventIdentifierSchema = z.union([z.number(), z.string()])

export const ruleExecutedTypeEventSchema = z
    .object({
        type: z.literal('rule-executed'),
    })
    .passthrough()
export type RuleExecutedTypeEventSchema = z.infer<
    typeof ruleExecutedTypeEventSchema
>

export const systemRuleEventSchema = z
    .object({
        data: z
            .object({
                type: z.literal(SYSTEM_RULE_TYPE),
            })
            .passthrough(),
    })
    .passthrough()
export type SystemRuleEventSchema = z.infer<typeof systemRuleEventSchema>

export const eventWithContextSchema = z
    .object({
        id: eventIdentifierSchema,
        context: z.string().min(1),
        created_datetime: z.string(),
    })
    .passthrough()
export type EventWithContextSchema = z.infer<typeof eventWithContextSchema>

export const ruleExecutedEventWithContextSchema = eventWithContextSchema.extend(
    {
        type: z.literal('rule-executed'),
    },
)
export type RuleExecutedEventWithContextSchema = z.infer<
    typeof ruleExecutedEventWithContextSchema
>

export const phoneEventSchema = ticketEventSchema.extend({
    type: z.enum(PHONE_EVENTS),
})
export type PhoneEventSchema = z.infer<typeof phoneEventSchema>

type AuditLogEventType = (typeof AUDIT_LOG_EVENT_TYPES)[number]

const auditLogEventBaseSchema = ticketEventSchema.extend({
    context: z.string().nullable().optional(),
    user_id: z.number().nullable().optional(),
})

const auditLogEventDataSchema = z
    .object({
        auto_assigned: z.boolean().optional(),
    })
    .passthrough()

const auditLogIdSchema = eventIdentifierSchema

const auditLogFailedRuleActionSchema = z
    .object({
        action_name: z.string(),
        failure_reason: z.string(),
    })
    .passthrough()

const auditLogCustomerSchema = z
    .object({
        id: auditLogIdSchema,
        name: z.string().optional(),
    })
    .passthrough()

const createAuditLogEventSchema = <
    TType extends AuditLogEventType,
    TData extends z.ZodTypeAny,
>(
    type: TType,
    data: TData,
) =>
    auditLogEventBaseSchema.extend({
        type: z.literal(type),
        data,
    })

const createAuditLogEventSchemaWithOptionalData = <
    TType extends AuditLogEventType,
>(
    type: TType,
) => createAuditLogEventSchema(type, auditLogEventDataSchema.nullish())

export const auditLogEventSchema = z.discriminatedUnion('type', [
    createAuditLogEventSchema(
        'rule-suggestion-suggested',
        auditLogEventDataSchema
            .extend({
                slug: z.string().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-assigned',
        auditLogEventDataSchema
            .extend({
                assignee_user_id: z.number().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData('ticket-closed'),
    createAuditLogEventSchema(
        'ticket-created',
        auditLogEventDataSchema
            .extend({
                split_from_ticket: z
                    .object({
                        id: auditLogIdSchema,
                        closed_datetime: z.string().optional(),
                    })
                    .passthrough()
                    .optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-split',
        auditLogEventDataSchema
            .extend({
                after_days: z.number().optional(),
                split_into_ticket: z
                    .object({
                        id: auditLogIdSchema,
                    })
                    .passthrough()
                    .optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-customer-updated',
        auditLogEventDataSchema
            .extend({
                new_customer: auditLogCustomerSchema.optional(),
                old_customer: auditLogCustomerSchema.optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData(
        'ticket-excluded-from-auto-merge',
    ),
    createAuditLogEventSchemaWithOptionalData('ticket-excluded-from-csat'),
    createAuditLogEventSchemaWithOptionalData('ticket-marked-spam'),
    createAuditLogEventSchemaWithOptionalData('ticket-merged'),
    createAuditLogEventSchema(
        'ticket-message-summary-created',
        auditLogEventDataSchema
            .extend({
                first_unseen_id: auditLogIdSchema.nullable().optional(),
                last_unseen_id: auditLogIdSchema.nullable().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData('ticket-reopened'),
    createAuditLogEventSchema(
        'ticket-satisfaction-survey-skipped',
        auditLogEventDataSchema
            .extend({
                reasons: z.array(z.string()).optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData('ticket-self-unsnoozed'),
    createAuditLogEventSchemaWithOptionalData('ticket-snoozed'),
    createAuditLogEventSchema(
        'ticket-subject-updated',
        auditLogEventDataSchema
            .extend({
                new_subject: z.string().optional(),
                old_subject: z.string().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-tags-added',
        auditLogEventDataSchema
            .extend({
                tags_added: z.array(auditLogIdSchema).optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-tags-removed',
        auditLogEventDataSchema
            .extend({
                tags_removed: z.array(auditLogIdSchema).optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchema(
        'ticket-team-assigned',
        auditLogEventDataSchema
            .extend({
                assignee_team_id: z.number().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData('ticket-team-unassigned'),
    createAuditLogEventSchemaWithOptionalData('ticket-trashed'),
    createAuditLogEventSchemaWithOptionalData('ticket-unassigned'),
    createAuditLogEventSchemaWithOptionalData('ticket-unmarked-spam'),
    createAuditLogEventSchemaWithOptionalData('ticket-untrashed'),
    createAuditLogEventSchema(
        'rule-executed',
        auditLogEventDataSchema
            .extend({
                code: z.string().optional(),
                failed_actions: z
                    .array(auditLogFailedRuleActionSchema)
                    .optional(),
                id: auditLogIdSchema.optional(),
                name: z.string().optional(),
                slug: z.string().optional(),
                triggering_event_type: z.string().optional(),
            })
            .nullish(),
    ),
    createAuditLogEventSchemaWithOptionalData('satisfaction-survey-sent'),
])
export type AuditLogEventSchema = z.infer<typeof auditLogEventSchema>

export const privateReplyActionEventSchema = ticketEventSchema.extend({
    data: z.object({
        action_name: z.enum(PRIVATE_REPLY_ACTIONS),
    }),
})
export type PrivateReplyActionEventSchema = z.infer<
    typeof privateReplyActionEventSchema
>

export const renderableActionExecutedActionNameSchema = z.enum(
    RENDERABLE_ACTION_EXECUTED_ACTIONS,
)
export type RenderableActionExecutedActionNameSchema = z.infer<
    typeof renderableActionExecutedActionNameSchema
>

const shopifyActionExecutedPayloadSchema = z
    .object({
        order_id: z.number().optional(),
        draft_order_id: z.number().optional(),
        draft_order_name: z.string().optional(),
        item_id: z.number().optional(),
        quantity: z.number().optional(),
        tags_list: z.string().optional(),
        note: z.string().optional(),
    })
    .passthrough()

const rechargeActionExecutedPayloadSchema = z
    .object({
        subscription_id: z.number().optional(),
        charge_id: z.number().optional(),
    })
    .passthrough()

const bigCommerceActionExecutedPayloadSchema = z
    .object({
        bigcommerce_order_id: z.number().optional(),
        bigcommerce_checkout_id: z.union([z.string(), z.number()]).optional(),
    })
    .passthrough()

const customHttpActionExecutedPayloadSchema = z.object({}).passthrough()

const actionExecutedEventDataBaseSchema = z
    .object({
        action_id: z.string().optional(),
        action_name: renderableActionExecutedActionNameSchema,
        action_label: z.string().nullable().optional(),
        app_id: z.union([z.string(), z.number()]).nullable().optional(),
        integration_id: z.union([z.string(), z.number()]).nullable().optional(),
        payload: z.object({}).passthrough(),
        status: z.string().optional(),
        msg: z.string().optional(),
    })
    .passthrough()

const createActionExecutedEventDataSchema = <
    TActionName extends RenderableActionExecutedActionNameSchema,
>(
    actionName: TActionName,
    payloadSchema: z.ZodTypeAny,
) =>
    actionExecutedEventDataBaseSchema.extend({
        action_name: z.literal(actionName),
        payload: payloadSchema,
    })

export const actionExecutedEventSchema = ticketEventSchema.extend({
    type: z.literal(ACTION_EXECUTED_EVENT_TYPE),
    data: z.discriminatedUnion('action_name', [
        createActionExecutedEventDataSchema(
            'shopifyRefundShippingCostOfOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyCancelOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyRefundOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyFullRefundOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyCreateOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyDuplicateOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifySendDraftOrderInvoice',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyPartialRefundOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyUpdateOrderTags',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyUpdateCustomerTags',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyEditOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyEditShippingAddressOfOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'shopifyEditNoteOfOrder',
            shopifyActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'bigcommerceCreateOrder',
            bigCommerceActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'bigcommerceDuplicateOrder',
            bigCommerceActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'bigcommerceRefundOrder',
            bigCommerceActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeCancelSubscription',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeActivateSubscription',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeSkipCharge',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeUnskipCharge',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeRefundCharge',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'rechargeRefundOrder',
            rechargeActionExecutedPayloadSchema,
        ),
        createActionExecutedEventDataSchema(
            'customHttpAction',
            customHttpActionExecutedPayloadSchema,
        ),
    ]),
})
export type ActionExecutedEventSchema = z.infer<
    typeof actionExecutedEventSchema
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
