// @flow
import {fromJS} from 'immutable'

export const events = fromJS([{
    label: 'ticket created',
    value: 'ticket-created',
}, {
    label: 'ticket updated',
    value: 'ticket-updated',
}, {
    label: 'ticket assigned',
    value: 'ticket-assigned',
}, {
    label: 'new message in ticket',
    value: 'ticket-message-created',
}])

// variables available in rules
export const availableVariables = ['ticket', 'message', 'event', 'user']

// collections operators
export const collectionOperators = [
    'containsAll',
    'containsAny',
    'notContainsAll',
    'notContainsAny',
]

export const deprecatedOperators = [
    'contains',
    'notContains'
]

export const timedeltaOperators = [
    'gteTimedelta',
    'lteTimedelta'
]

export const datetimeOperators = [
    'gte',
    'lte',
    ...timedeltaOperators
]
