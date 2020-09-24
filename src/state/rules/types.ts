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
}

export type Rule = RuleDraft & {
    created_datetime: string
    id: number
    priority: number
    schedule: Maybe<string>
    type: RuleType
    updated_datetime: string
    uri: string
}

export type RulePriority = {
    id: number
    priority: number
}

export type ObjectExpressionProperty = {
    type: 'Property'
    key: {
        type: 'Identifier'
        name: string
    }
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
}

export enum RuleEvent {
    TicketCreated = 'ticket-created',
    TicketUpdated = 'ticket-updated',
    TicketAssigned = 'ticket-assigned',
    TicketMessageCreated = 'ticket-message-created',
}

export enum RuleType {
    User = 'user',
}

export enum CollectionOperator {
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
