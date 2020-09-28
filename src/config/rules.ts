import {fromJS} from 'immutable'

export const events = fromJS([
    {
        label: 'ticket created',
        value: 'ticket-created',
    },
    {
        label: 'ticket updated',
        value: 'ticket-updated',
    },
    {
        label: 'ticket assigned',
        value: 'ticket-assigned',
    },
    {
        label: 'new message in ticket',
        value: 'ticket-message-created',
    },
])

// variables available in rules
export const availableVariables = ['ticket', 'message', 'event']

// collections operators
//$TsFixMe fallback for js files use CollectionOperator enum instead
export const collectionOperators = [
    'containsAll',
    'containsAny',
    'notContainsAll',
    'notContainsAny',
]

//$TsFixMe fallback for js files use DeprecatedOperator enum instead
export const deprecatedOperators = ['contains', 'notContains']

//$TsFixMe fallback for js files use TimedeltaOperator enum instead
export const timedeltaOperators = ['gteTimedelta', 'lteTimedelta']

//$TsFixMe fallback for js files use TimedeltaOperator and DatetimeOperator enums instead
export const datetimeOperators = ['gte', 'lte', ...timedeltaOperators]

export const caseInsensitiveOperators = [
    'endsWith',
    'startsWith',
    ...collectionOperators,
    ...deprecatedOperators,
]
