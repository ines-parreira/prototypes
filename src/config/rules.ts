import {fromJS, List} from 'immutable'

export const eventNameToLabel: {[name: string]: string} = {
    'ticket-created': 'ticket created',
    'ticket-updated': 'ticket updated',
    'ticket-assigned': 'ticket assigned to user',
    'ticket-self-unsnoozed': 'ticket snooze delay ends',
    'ticket-message-created': 'new message in ticket',
}

export const events = fromJS([
    {
        label: eventNameToLabel['ticket-created'],
        value: 'ticket-created',
    },
    {
        label: eventNameToLabel['ticket-updated'],
        value: 'ticket-updated',
    },
    {
        label: eventNameToLabel['ticket-assigned'],
        value: 'ticket-assigned',
    },
    {
        label: eventNameToLabel['ticket-self-unsnoozed'],
        value: 'ticket-self-unsnoozed',
    },
    {
        label: eventNameToLabel['ticket-message-created'],
        value: 'ticket-message-created',
    },
]) as List<any>

export const eventsDependencies = {
    'ticket-updated': ['ticket-assigned', 'ticket-self-unsnoozed'],
}

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
