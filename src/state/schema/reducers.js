import {fromJS} from 'immutable'
import * as types from './constants'

const initialState = fromJS({})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_SCHEMAS_START:
            return state
        case types.FETCH_SCHEMAS_SUCCESS:
            return fromJS(action.data)
        default:
            return state
    }
}
