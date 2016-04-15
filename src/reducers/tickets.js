import * as actions from '../actions/ticket'
import Immutable, { Map, List } from 'immutable'


const ticketsInitial = Map({
    items: List(),
    resp_meta: Map(),
    loading: false,
    search: '',
    currentIndex: null
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state

        case actions.FETCH_TICKET_LIST_VIEW_START:
            return state.set('loading', true)

        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return Map({
                items: Immutable.fromJS(action.resp.data),
                resp_meta: Immutable.fromJS(action.resp.meta),
                loading: false,
                search: state.get('search')
            })

        case actions.SEARCH:
            return state.set('search', action.searchValue)

        case actions.SAVE_INDEX:
            return state.set('currentIndex', action.currentIndex)

        default:
            return state
    }
}
