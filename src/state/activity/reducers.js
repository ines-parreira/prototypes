import * as types from './constants'
import {fromJS} from 'immutable'

const initialState = fromJS({
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
            const tickets = action.resp.tickets

            // see if the latest git_commit is different
            const newVersion = action.resp.git_commit !== ''
                && action.resp.git_commit !== state.get('git_commit')

            return state.merge({
                tickets,
                newVersion,
            }).setIn(['_internal', 'loading'], false)
        }

        case types.TICKET_VIEWED: {
            const objectId = parseInt(action.ticketId, 10)

            // Don't display the red dot if the current ticket has something new
            const ticketIndex = state.get('tickets', fromJS([])).findIndex((ticket) => ticket.get('id') === objectId)
            let newState = state

            if (~ticketIndex) {
                newState = state.setIn(['tickets', ticketIndex, 'has_something_new'], false)
            }

            return newState
        }

        default:
            return state
    }
}
