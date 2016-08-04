import * as types from '../constants/settings'
import {Map} from 'immutable'

export const initial = Map({
    data: Map(),
    loading: false,
    loaded: false
})

export function settings(state = initial, action) {
    switch (action.type) {
        case types.FETCH_SETTINGS_START:
            return state.set('loading', true)

        case types.FETCH_SETTINGS_SUCCESS:
            return state.merge({
                data: action.resp,
                loading: false,
                loaded: true
            })

        default:
            return state
    }
}
