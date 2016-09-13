import {fromJS} from 'immutable'
import * as types from './constants'

export const initialState = fromJS({})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_STATS_START:
            return state
        case types.FETCH_STATS_SUCCESS:
            return fromJS(action.resp)
        default:
            return state
    }
}
