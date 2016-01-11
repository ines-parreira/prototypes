import Immutable from 'immutable'

import * as actions from '../actions/schema'

const initialState = Immutable.Map()

export function schemas(state = initialState, action) {
    switch (action.type) {
        case actions.FETCH_SCHEMAS_START:
            return state
        case actions.FETCH_SCHEMAS_SUCCESS:
            return Immutable.fromJS(action.data)
        default:
            return state
    }
}
