import {NEW_TICKET, FETCH_TICKET_LIST_VIEW_START, FETCH_TICKET_LIST_VIEW_FINISH} from '../actions/ticket'
import Immutable from 'immutable'

const initialState = Immutable.List([])

export function tickets(state = initialState, action) {
    switch (action.type) {
        case NEW_TICKET:
            return state
        case FETCH_TICKET_LIST_VIEW_START:
            // here we should probably set the state as fetching (display that something is happening in the UI)
            return state
        case FETCH_TICKET_LIST_VIEW_FINISH:
            return Immutable.List(action.resp.data)
        default:
            return state
    }
}
