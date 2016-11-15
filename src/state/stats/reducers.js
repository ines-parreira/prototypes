import {fromJS} from 'immutable'
import * as types from './constants'

export const initialState = fromJS({
    _internal: {
        loading: {
            stats: false
        },
        meta: {
            period: 'this-month'
        },
        filters: {}
    }
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_STATS_START: {
            return state.setIn(['_internal', 'loading', 'stats'], true)
        }

        case types.FETCH_STATS_SUCCESS: {
            return state
                .set(action.resp.type, fromJS(action.resp.data))
                .setIn(['_internal', 'meta'],
                    state.getIn(['_internal', 'meta'], fromJS({}))
                        .merge(fromJS(action.resp.meta))
                )
                .setIn(['_internal', 'loading', 'stats'], false)
        }

        case types.FETCH_STATS_ERROR: {
            return state.setIn(['_internal', 'loading', 'stats'], false)
        }

        case types.SET_STATS_META: {
            return state.setIn(['_internal', 'meta'],
                state.getIn(['_internal', 'meta'], fromJS({}))
                    .merge(fromJS(action.meta))
            )
        }

        case types.SET_STATS_FILTER: {
            return state.setIn(['_internal', 'filters', action.name], fromJS(action.values))
        }

        default:
            return state
    }
}
