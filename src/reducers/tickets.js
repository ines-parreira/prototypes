import * as actions from '../actions/ticket'
import {Map} from 'immutable'

const ticketsInitial = Map({
    items: [],
    page: 1,
    nextPage: 1,
    loading: true,
    resp: {
        meta: {
            view: {
                name: ""
            },
            item_count: 1000
        }
    }
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state
        case actions.FETCH_TICKET_LIST_VIEW_START:
            return state.set('loading', true)
        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return Map({
                items: [...state.get('items'), ...action.resp.data],
                page: state.get('page') + 1,
                loading: false,
                resp: action.resp          
            })
        default:
            return state
    }
}
