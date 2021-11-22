import {fromJS, Map, List} from 'immutable'
import moment from 'moment'

import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {ChatsState} from './types'

export const initialState: ChatsState = fromJS({
    tickets: [],
})

const sortChats = (ticket: Map<any, any>) =>
    -moment(ticket.get('last_message_datetime'))

export default function reducer(
    state: ChatsState = initialState,
    action: GorgiasAction
): ChatsState {
    switch (action.type) {
        case constants.SET_CHATS: {
            return state.update(
                'tickets',
                () =>
                    (fromJS(action.tickets) as List<any>).sortBy(
                        sortChats
                    ) as List<any>
            )
        }

        case constants.ADD_CHAT: {
            const newTicket = fromJS(action.ticket) as Map<any, any>
            let newState = state

            const index = (
                newState.get('tickets', fromJS([])) as List<any>
            ).findIndex(
                (ticket: Map<any, any>) =>
                    ticket.get('id') === newTicket.get('id')
            )

            if (~index) {
                // update the existing chat
                newState = newState.mergeIn(['tickets', index], newTicket)
            } else {
                // add the new chat
                newState = newState.update('tickets', (tickets: List<any>) =>
                    tickets.push(newTicket)
                )
            }

            return newState.update('tickets', (tickets: List<any>) =>
                tickets.sortBy(sortChats)
            )
        }

        case constants.REMOVE_CHAT: {
            return state.update('tickets', (tickets: List<any>) =>
                tickets.filter(
                    (ticket: Map<any, any>) =>
                        ticket.get('id') !== action.ticketId
                )
            )
        }

        case constants.MARK_CHAT_AS_UNREAD:
        case constants.MARK_CHAT_AS_READ: {
            const ticketId = parseInt(action.ticketId as unknown as string, 10)

            return state.update('tickets', (tickets: List<any>) => {
                return tickets.map((ticket: Map<any, any>) => {
                    if (ticket.get('id') === ticketId) {
                        return ticket.set(
                            'is_unread',
                            action.type === constants.MARK_CHAT_AS_UNREAD
                        )
                    }

                    return ticket
                })
            })
        }

        default:
            return state
    }
}
