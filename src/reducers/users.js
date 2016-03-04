import * as actions from '../actions/user'
import {Map} from 'immutable'
import {_} from 'lodash'

const usersInitial = Map({
    items: [],
    sort: 'id',
    loading: true,
    resp: {}
})

export function users(state = usersInitial, action) {
    switch (action.type) {

        case actions.FETCH_USER_LIST_START:
            return Map({
                items: action.extend ? state.get('items') : [],
                sort: state.get('sort'),
                loading: action.extend ? true : false,
                resp: action.resp
            })

        case actions.FETCH_USER_LIST_SUCCESS:
            return Map({
                items: action.resp.data,
                sort: state.get('sort'),
                loading: false,
                resp: action.resp
            })

        case actions.CREATE_NEW_USER_SUCCESS:
            const oldItems = state.get('items')
            const newItem = action.resp

            return Map({
                items: _.concat(newItem, oldItems),
                sort: state.get('sort'),
                loading: false,
                resp: action.resp
            })

        case actions.UPDATE_USER_SUCCESS:
            const items = state.get('items')
            const userIndex = _.findIndex(items, {id: action.userId})

            return Map({
                items: [
                    ...items.slice(0, userIndex),
                    action.resp,
                    ...items.slice(userIndex + 1)
                ],
                sort: state.get('sort'),
                loading: state.get('loading'),
                resp: action.resp

            })

        case actions.DELETE_USER_SUCCESS:
            return Map({
                items: state.get('items').filter(function(item) {
                    return item.id !== action.userId
                }),
                sort: state.get('sort'),
                loading: state.get('loading'),
                resp: action.resp
            })

        case actions.SORT_USERS:
            return Map({
                items: action.sort !== state.get('sort') ? _.sortBy(state.get('items'), [action.sort]) : _.reverse(state.get('items')),
                sort: action.sort,
                loading: state.get('loading'),
                resp: state.get('resp')
            })

        default:
            return state
    }
}
