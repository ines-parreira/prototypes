import * as actions from '../actions/user'
import { Map, List, fromJS } from 'immutable'
import _ from 'lodash'

const usersInitial = Map({
    items: List(),
    agents: List(),
    displayItems: [],
    sort: 'id',
    loading: true,
    resp: {}
})

export function users(state = usersInitial, action) {
    const items = state.get('items')
    let newState = state
    let userIndex

    switch (action.type) {

        case actions.FETCH_USER_LIST_START:
            return state.merge({ loading: true })

        case actions.FETCH_USER_LIST_SUCCESS:
            if (action.role && action.role === 'agent') {
                newState = newState.set('agents', fromJS(action.resp.data))
            } else {
                newState = newState.set('items', fromJS(action.resp.data))
            }

            return newState.merge({
                loading: false,
                resp: action.resp
            })

        case actions.FETCH_USER_AGENT_LIST_SUCCESS:
            return state.merge({
                agents: action.resp.data,
                loading: false,
                resp: action.resp
            })

        case actions.CREATE_NEW_USER_SUCCESS:
            return state.merge({
                items: _.concat(action.resp, items),
                loading: false,
                resp: action.resp
            })

        case actions.UPDATE_USER_SUCCESS:
            return state.setIn(['items', items.findIndex(item => item.get('id') === action.userId)], fromJS(action.resp))

        case actions.DELETE_USER_SUCCESS:
            return state.merge({
                items: state.get('items').filter((item) => item.id !== action.userId),
                resp: action.resp
            })

        case actions.SORT_USERS:
            return state.merge({
                items: action.sort !== state.get('sort') ? _.sortBy(state.get('items'), [action.sort]) : _.reverse(state.get('items')),
                sort: action.sort
            })

        case actions.UPDATE_LIST:
            return state.merge({
                items: action.list
            })

        default:
            return state
    }
}
