import * as actions from '../actions/ticket'
import {fromJS, Map, List} from 'immutable'


const ticketsInitial = Map({
    items: List(),
    resp_meta: Map(),
    loading: false,
    search: '',
    currentTicketIndex: null
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.FETCH_TICKET_LIST_VIEW_START:
            return state.set('loading', true)

        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return state.merge({
                items: fromJS(action.resp.data),
                resp_meta: fromJS(action.resp.meta),
                loading: false,
                search: state.get('search')
            })

        case actions.SEARCH:
            return state.set('search', action.searchValue)

        case actions.SAVE_INDEX:
            return state.set('currentTicketIndex', action.currentTicketIndex)

        default:
            return state
    }
}
