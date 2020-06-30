// @flow
import {fromJS, type Map} from 'immutable'
import moment from 'moment'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    tickets: [],
})

type defaultActionType = actionType & {
    ticketId: string,
    tickets: Array<{}>,
}

const sortChats = (ticket) => -moment(ticket.get('last_message_datetime'))

export default function reducer(
    state: Map<*, *> = initialState,
    action: defaultActionType
): Map<*, *> {
    switch (action.type) {
        case constants.SET_CHATS: {
            return state.update('tickets', () =>
                fromJS(action.tickets).sortBy(sortChats)
            )
        }

        case constants.ADD_CHAT: {
            const newTicket = fromJS(action.ticket)
            let newState = state

            const index = newState
                .get('tickets', fromJS([]))
                .findIndex((ticket) => ticket.get('id') === newTicket.get('id'))

            if (~index) {
                // update the existing chat
                newState = newState.mergeIn(['tickets', index], newTicket)
            } else {
                // add the new chat
                newState = newState.update('tickets', (tickets) =>
                    tickets.push(newTicket)
                )
            }

            return newState.update('tickets', (tickets) =>
                tickets.sortBy(sortChats)
            )
        }

        case constants.REMOVE_CHAT: {
            return state.update('tickets', (ticket) =>
                ticket.filter((ticket) => ticket.get('id') !== action.ticketId)
            )
        }

        case constants.MARK_CHAT_AS_READ: {
            const ticketId = parseInt(action.ticketId, 10)

            return state.update('tickets', (tickets) => {
                return tickets.map((ticket) => {
                    if (ticket.get('id') === ticketId) {
                        return ticket.set('is_unread', false)
                    }

                    return ticket
                })
            })
        }

        default:
            return state
    }
}
