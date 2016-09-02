import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    data: {},
    loading: false,
    loaded: false
})

export default (state = initialState, action) => {
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
