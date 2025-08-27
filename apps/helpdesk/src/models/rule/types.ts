import { ReactNode } from 'react'

import esprima from 'esprima'

import type { User } from 'config/types/user'
import { HttpMethod } from 'models/api/types'
import type { Team } from 'models/team/types'
import {
    AnyManagedRuleSettings,
    ObjectExpressionPropertyKey,
} from 'state/rules/types'

export enum IdentifierCategoryKey {
    Message = 'message',
    Ticket = 'ticket',
    Customer = 'customer',
    ShopifyLastOrder = 'shopifyLastOrder',
    ShopifyCustomer = 'shopifyCustomer',
    Magento2LastOrder = 'magento2LastOrder',
    Magento2Customer = 'magento2Customer',
    RechargeLastSubscription = 'rechargeLastSubscription',
    RechargeCustomer = 'rechargeCustomer',
    SmileCustomer = 'smileCustomer',
    SelfServiceFlow = 'selfServiceFlow',
    BigCommerceCustomer = 'bigcommerceCustomer',
    BigCommerceLastOrder = 'bigcommerceLastOrder',
}

export enum IdentifierCategoryValue {
    Message = 'Message',
    Ticket = 'Ticket',
    Customer = 'Customer',
    Magento2Customer = 'Magento2 Customer',
    Magento2LastOrder = 'Magento2 Last Order',
    RechargeCustomer = 'Recharge Customer',
    RechargeLastSubscription = 'Recharge Last Subscription',
    ShopifyCustomer = 'Shopify Customer',
    ShopifyLastOrder = 'Shopify Last Order',
    SmileCustomer = 'Smile Customer',
    SelfServiceFlow = 'Self Service',
    BigCommerceCustomer = 'BigCommerce Customer',
    BigCommerceLastOrder = 'BigCommerce Last Order',
}

export enum IdentifierSubCategoryValue {
    Receiver = 'Receiver',
    Sender = 'Sender',
    Source = 'Source',
    LastFulfillment = 'Last Fulfillment',
    ShippingAddress = 'Shipping Address',
    LastOrderShipments = 'Last Order Shipments',
    LastShipping = 'Last Shipping',
}

export type RuleObject = {
    computed: boolean
    loc: Record<string, unknown>
    object: RuleObject | ObjectExpressionPropertyKey
    property: ObjectExpressionPropertyKey
    type: 'MemberExpression'
}

export type IdentifierElement = {
    label: string
    text: ReactNode
    value: string
}

export type RuleDraft = {
    id?: number
    code: string
    code_ast: esprima.Program
    deactivated_datetime: Maybe<string>
    description: string
    event_types: RuleEvent | string
    name: string
    type?: RuleType
    settings?: AnyManagedRuleSettings
}

export type Rule = RuleDraft & {
    created_datetime: string
    id: number
    priority: number
    schedule: Maybe<string>
    updated_datetime: string
    uri: string
}

export enum RuleEvent {
    TicketCreated = 'ticket-created',
    TicketUpdated = 'ticket-updated',
    TicketAssigned = 'ticket-assigned',
    TicketSelfUnsnoozed = 'ticket-self-unsnoozed',
    TicketMessageCreated = 'ticket-message-created',
}

export enum RuleType {
    User = 'user',
    System = 'system',
    Managed = 'managed',
}

export type RulePriority = {
    id: number
    priority: number
}

export type RuleActionAttachment = {
    url: string
    content_type?: string
    name?: string
    size?: number
}

export type RuleAction = {
    name: ActionType
    args: {
        attachments?: RuleActionAttachment[]
        body_html?: string
        body_text?: string
        tags?: string
        method?: HttpMethod
        headers?: Record<string, unknown>[]
        url?: string
        params?: Record<string, unknown>[]
        status?: string
        assignee_user?: User
        assignee_team?: Team
        subject?: string
        snooze_timedelta?: string
        to?: string
        cc?: string
        bcc?: string
        from?: string
    }
}

export const ACTION_TYPES = [
    'addInternalNote',
    'addTags',
    'applyMacro',
    'excludeFromAutoMerge',
    'excludeFromCSAT',
    'facebookHideComment',
    'facebookLikeComment',
    'removeTags',
    'replyToTicket',
    'sendEmail',
    'snoozeTicket',
    'setAssignee',
    'setCustomFieldValue',
    'setStatus',
    'setSubject',
    'setTags',
    'setTeamAssignee',
    'trashTicket',
    'setPriority',
] as const

export type ActionType = (typeof ACTION_TYPES)[number]
