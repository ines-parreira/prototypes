import * as actions from '../actions/ticket'
import { TICKET_TAGS, TICKET_ASSIGNEE } from '../constants'
import { Map } from 'immutable'
import { _ } from 'lodash'

const ticketsInitial = Map({
    items: [],
    resp_meta: {},
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            return ticketsInitial
        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return Map({
                items: action.resp.data,
                resp_meta: action.resp.meta,
            })
        default:
            return state
    }
}
