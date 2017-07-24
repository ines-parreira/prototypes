import {fromJS} from 'immutable'
import * as types from './constants.js'

export const initialState = fromJS({
    pagination: {},
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_AGENTS_PAGINATION_SUCCESS: {
            return state.set('pagination', fromJS(action.resp))
        }

        default:
            return state
    }
}
