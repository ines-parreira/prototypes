import * as actions from '../actions/ticket'
import { Map } from 'immutable'
import { _ } from 'lodash'
import { getCode, getAST } from './rule'


const ticketsInitial = Map({
    items: [],
    resp_meta: {},
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            // Re-render as little as possible
            return state
        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return Map({
                items: action.resp.data,
                resp_meta: action.resp.meta,
            })
        default:
            return state
    }
}
