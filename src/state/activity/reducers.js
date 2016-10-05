import * as types from './constants'
import {fromJS} from 'immutable'

const initialState = fromJS({
    _internal: {
        loading: false,
    },
    tickets: [],
    // Count how many new events since we visited the ticket. Ex: 999: {count: 0, created_datetime: 'now'}
    objectsCounter: {},
    pendingEvents: [] // events to be sent to the server
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.SUBMIT_ACTIVITY_START:
            return state.setIn(['_internal', 'loading'], true)

        case types.SUBMIT_ACTIVITY_ERROR:
            return state.setIn(['_internal', 'loading'], false)

        case types.SUBMIT_ACTIVITY_SUCCESS: {
            const tickets = action.resp.tickets

            return state.merge({
                // clean the pending events that we've sent in the action
                pendingEvents: initialState.get('pendingEvents'),
                tickets
            }).setIn(['_internal', 'loading'], false)
        }

        case types.TICKET_VIEWED: {
            const objectId = parseInt(action.ticketId, 10)

            // Collect the pending viewed events to be sent to the server
            const pendingEvents = state.get('pendingEvents').push(fromJS({
                type: 'ticket-viewed',
                object_type: 'Ticket',
                object_id: objectId
            }))

            // Don't display the red dot if the current ticket has something new
            const ticketIndex = state.get('tickets', fromJS([])).findIndex((ticket) => ticket.get('id') === objectId)
            let newState = state

            if (~ticketIndex) {
                newState = state.setIn(['tickets', ticketIndex, 'has_something_new'], false)
            }

            return newState.merge({
                pendingEvents
            })
        }

        default:
            return state
    }
}
