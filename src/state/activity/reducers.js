import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    _internal: {
        loading: false,
    },
    tickets: [],
    git_commit: '',
    newVersion: false
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SUBMIT_ACTIVITY_START:
            return state.setIn(['_internal', 'loading'], true)

        case types.SUBMIT_ACTIVITY_ERROR:
            return state.setIn(['_internal', 'loading'], false)

        case types.SUBMIT_ACTIVITY_SUCCESS: {
            return state.merge({
                git_commit: action.resp.git_commit
            }).setIn(['_internal', 'loading'], false)
        }

        case types.SUBMIT_CHATS_SUCCESS: {
            const tickets = action.resp.tickets
            return state.merge({tickets})
        }

        case types.TICKET_VIEWED: {
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
