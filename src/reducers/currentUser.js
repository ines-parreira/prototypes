import * as actions from '../actions/user'
import { Map } from 'immutable'

const initial = Map()

export function currentUser(state = initial, action) {
    switch (action.type) {
        case actions.FETCH_CURRENT_USER_SUCCESS:
            return Map(action.resp)
        default:
            return state
    }
}
