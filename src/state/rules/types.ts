import esprima from 'esprima'
import {Map} from 'immutable'

export type RuleDraft = {
    id?: number
    code: string
    code_ast: ReturnType<typeof esprima.parse>
    deactivated_datetime: Maybe<string>
    description: string
    event_types: RuleEvent | string
    name: string
    type?: RuleType
}

export type Rule = RuleDraft & {
    created_datetime: string
    id: number
    priority: number
    schedule: Maybe<string>
    updated_datetime: string
    uri: string
}

export type RulePriority = {
    id: number
    priority: number
}

export type ObjectExpressionPropertyKey = {
    type: 'Identifier'
    name: string
}

export type ObjectExpressionProperty = {
    type: 'Property'
    key: ObjectExpressionPropertyKey
    computed: boolean
    value: {
        type: 'Literal'
        value: string
        raw: string
    }
    kind: 'init'
    method: boolean
    shorthand: boolean
}

export type ObjectExpression = {
    type: 'ObjectExpression'
    properties: ObjectExpressionProperty[]
}

export type RulesState = Map<any, any>

export enum RuleOperation {
    Update = 'UPDATE',
    Insert = 'INSERT',
    Delete = 'DELETE',
    UpdateLogicalOperator = 'UPDATE_LOGICAL_OPERATOR',
    DeleteBinaryExpression = 'DELETE_BINARY_EXPRESSION',
    UpdateIfStatement = 'UPDATE_IF_STATEMENT',
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

export enum EqualityOperator {
    Eq = 'eq',
    Neq = 'neq',
}

export enum CollectionOperator {
    IsEmpty = 'isEmpty',
    ContainsAll = 'containsAll',
    ContainsAny = 'containsAny',
    NotContainsAll = 'notContainsAll',
    NotContainsAny = 'notContainsAny',
}

export enum DeprecatedOperator {
    Contains = 'contains',
    NotContains = 'notContains',
}

export enum TimedeltaOperator {
    GTETimedelta = 'gteTimedelta',
    LTETimedelta = 'lteTimedelta',
}

export enum DatetimeOperator {
    GTE = 'gte',
    LTE = 'lte',
}

export enum RuleObjectType {
    Ticket = 'Ticket',
    TicketMessage = 'TicketMessage',
}

export enum RuleLimitStatus {
    NonReaching = 'nonReaching',
    Reaching = 'reaching',
    Reached = 'reached',
}

// Managed Rule Typing
export enum ManagedRulesSlugs {
    AutoCloseSpam = 'non-support-related-emails',
    AutoReplyWismo = 'auto-reply-wismo',
    AutoReplyFAQ = 'auto-reply-faq-questions',
    AutoReplyReturn = 'auto-reply-return-request',
}
export type ManagedRuleEmptySettings = {
    slug: ManagedRulesSlugs
}

export type ManagedRuleSettings<T = ManagedRuleEmptySettings> =
    ManagedRuleEmptySettings & T

export type AnyManagedRuleSettings =
    | ManagedRuleSettings<AutoCloseSpamSettings>
    | ManagedRuleSettings<AutoReplyFAQSettings>
    | ManagedRuleSettings<AutoReplyWismoSettings>
    | ManagedRuleSettings<AutoReplyReturnSettings>

export type AutoCloseSpamSettings = {
    allow_list?: string[]
    block_list?: string[]
}

export type AutoReplyWismoSettings = {
    block_list?: string[]
    body_text?: string
    body_html?: string
    signature_text?: string
    signature_html?: string
}

export type AutoReplyReturnSettings = {
    return_portal_url?: string
    block_list?: string[]
    body_text?: string
    body_html?: string
    signature_text?: string
    signature_html?: string
}

export type AutoReplyFAQSettings = {
    block_list?: string[]
    body_text?: string
    body_html?: string
    signature_text?: string
    signature_html?: string
    help_center_id?: number
}

export type ManagedRule<T = ManagedRuleEmptySettings> = Rule & {
    settings: ManagedRuleSettings<T>
    type: RuleType.Managed
}
