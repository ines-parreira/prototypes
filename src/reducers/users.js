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
            const newItems = action.resp.data

            return Map({
                items: _.concat(oldItems, newItems),
                loading: false,
                resp: action.resp
            })

        default:
            return state
    }
}
