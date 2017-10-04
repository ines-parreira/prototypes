import {fromJS} from 'immutable'

export const events = fromJS([{
    label: 'Ticket created',
    value: 'ticket-created',
}, {
    label: 'Ticket updated',
    value: 'ticket-updated',
}, {
    label: 'Ticket assigned',
    value: 'ticket-assigned',
}, {
    label: 'New message in ticket',
    value: 'ticket-message-created',
}])

// variables available in rules
export const availableVariables = ['ticket', 'message', 'event', 'user']
