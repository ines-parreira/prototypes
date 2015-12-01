import * as actions from '../actions/ticket'
import {List, Map} from 'immutable'

export function tickets(state = List([]), action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            // here we should probably set the state as fetching (display that something is happening in the UI)
            return state
        case actions.FETCH_TICKET_LIST_VIEW_FINISH:
            return List(action.resp.data)
        default:
            return state
    }
}

const ticketInitial = Map()
export function ticket(state = ticketInitial, action) {
    switch (action.type) {
        case actions.FETCH_TICKET_START:
            return state
        case actions.FETCH_TICKET_FINISH:
            return Map(action.resp)
        default:
            return state
    }
}
