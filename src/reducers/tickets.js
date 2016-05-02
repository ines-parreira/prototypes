import * as actions from '../actions/ticket'
import Immutable, { Map, List } from 'immutable'


const ticketsInitial = Map({
    items: List(),
    resp_meta: Map(),
    loading: false,
    search: '',
    currentTicketIndex: null,
    sort: 'updated_datetime_asc'
})

export function tickets(state = ticketsInitial, action) {
    switch (action.type) {
        case actions.NEW_TICKET:
            return state

        case actions.FETCH_TICKET_LIST_VIEW_START:
            return state.set('loading', true)

        case actions.FETCH_TICKET_LIST_VIEW_SUCCESS:
            return state.merge({
                items: Immutable.fromJS(action.resp.data),
                resp_meta: Immutable.fromJS(action.resp.meta),
                loading: false,
                search: state.get('search'),
            })

        case actions.SEARCH:
            return state.set('search', action.searchValue)

        case actions.SAVE_INDEX:
            return state.set('currentTicketIndex', action.currentTicketIndex)

        case actions.SORT_TICKETS:
            if (action.sortProperty === 'updated_datetime') {
                return state.set('sort', state.get('sort') === 'updated_datetime_asc' ? 'updated_datetime_desc' : 'updated_datetime_asc')
            } else if (action.sortProperty === 'created_datetime') {
                return state.set('sort', state.get('sort') === 'created_datetime_asc' ? 'created_datetime_desc' : 'created_datetime_asc')
            }

        default:
            return state
    }
}
