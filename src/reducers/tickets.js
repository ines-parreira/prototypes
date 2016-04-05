import * as actions from '../actions/ticket'
import Immutable, { Map, List } from 'immutable'
import _ from 'lodash'
import { getCode, getAST } from './rule'


const ticketsInitial = Map({
    items: List(),
    resp_meta: Map(),
    loading: false,
    search: ''
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

        default:
            return state
    }
}
