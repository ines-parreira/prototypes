import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    _internal: {
        loading: {}
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.UPDATE_ACCOUNT_START:
            return state.setIn(['_internal', 'loading', 'updateAccount'], true)
        case types.UPDATE_ACCOUNT_ERROR:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false)
        case types.UPDATE_ACCOUNT_SUCCESS:
            return state.setIn(['_internal', 'loading', 'updateAccount'], false).merge(action.resp)
        default:
            return state
    }
}
