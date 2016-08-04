import Immutable from 'immutable'
import * as types from '../constants/schema'

const initialState = Immutable.Map()

export function schemas(state = initialState, action) {
    switch (action.type) {
        case types.FETCH_SCHEMAS_START:
            return state
        case types.FETCH_SCHEMAS_SUCCESS:
            return Immutable.fromJS(action.data)
        default:
            return state
    }
}
