import * as actions from '../actions/ticket'
import {Map} from 'immutable'
import {_} from 'lodash'

const ticketsInitial = Map({
    items: [],
    page: 0,
    loading: true,
    endReached: false,
    resp: {
        meta: {
            view: {
                name: ""
            },
        }
    }
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            if (action.extend) {
                return state.set('loading', true)
            } else {
                return ticketsInitial
            }
        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            const oldItems = action.extend ? state.get('items') : []
            const newItems = action.resp.data

            return Map({
                items: _.concat(oldItems, newItems),
                page: action.resp.meta.page,
                loading: false,
                resp: action.resp,
                endReached: _.isEmpty(newItems)
            })
        default:
            return state
    }
}
