// @flow
import * as constants from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    _internal: {
        loading: false,
    },
    tickets: [],
    newVersion: false
})

import type {Map} from 'immutable'
import type {actionType} from '../types'

type defaultActionType = actionType & {
    ticketId: string,
    resp: {
        tickets: Array<{}>
    }
}

export default (state: Map<*,*> = initialState, action: defaultActionType): Map<*,*> => {
    switch (action.type) {
        case constants.SUBMIT_ACTIVITY_START:
            return state.setIn(['_internal', 'loading'], true)

        case constants.SUBMIT_ACTIVITY_ERROR:
            return state.setIn(['_internal', 'loading'], false)

        case constants.SUBMIT_ACTIVITY_SUCCESS: {
            return state.setIn(['_internal', 'loading'], false)
        }

        case constants.SUBMIT_CHATS_SUCCESS: {
            const tickets = action.resp.tickets
            return state.merge({tickets})
        }

        case constants.TICKET_VIEWED: {
            const ticketId = parseInt(action.ticketId, 10)

            // Don't display the red dot if the current ticket has something new
            const ticketIndex = state.get('tickets', fromJS([])).findIndex((ticket) => ticket.get('id') === ticketId)
            let newState = state

            if (~ticketIndex) {
                newState = state.setIn(['tickets', ticketIndex, 'is_unread'], false)
            }

            return newState
        }

        default:
            return state
    }
}
