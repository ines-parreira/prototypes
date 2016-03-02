import * as actions from '../actions/user'
import {Map} from 'immutable'
import {_} from 'lodash'

const usersInitial = Map({
    items: [],
    loading: true,
    resp: {}
})

export function users(state = usersInitial, action) {
    switch (action.type) {

        case actions.FETCH_USER_LIST_START:
            return action.extend ? state.set('loading', true) : usersInitial

        case actions.FETCH_USER_LIST_SUCCESS:
            return Map({
                items: action.resp.data,
                loading: false,
                resp: action.resp
            })

        case actions.CREATE_NEW_USER_SUCCESS:
            const oldItems = state.get('items')
            const newItem = action.resp

            return Map({
                items: _.concat(newItem, oldItems),
                loading: false,
                resp: action.resp
            })

        case actions.UPDATE_USER_SUCCESS:
            const obj = Array.assign({}, state.get('items'))
            obj[action.userId] = action.resp

            return Map({
                items: obj,
                loading: false,
                resp: action.resp
            })

        default:
            return state
    }
}
