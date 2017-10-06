// @flow
import {fromJS} from 'immutable'
import * as constants from './constants'

import type {Map} from 'immutable'
import type {actionType} from '../types'

export const initialState = fromJS({
    _internal: {
        loading: {
            stats: false
        },
        meta: {},
        filters: {}
    }
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_STATS_START: {
            return state.setIn(['_internal', 'loading', 'stats'], true)
        }

        case constants.FETCH_STATS_SUCCESS: {
            return state
                .set(action.name, fromJS(action.resp.data))
                .updateIn(['_internal', 'meta'], meta => (meta || fromJS({})).merge(fromJS(action.resp.meta)))
                .setIn(['_internal', 'loading', 'stats'], false)
        }

        case constants.FETCH_STATS_ERROR: {
            return state.setIn(['_internal', 'loading', 'stats'], false)
        }

        case constants.SET_STATS_META: {
            return state.updateIn(['_internal', 'meta'], meta => (meta || fromJS({})).merge(fromJS(action.meta)))
        }

        case constants.SET_STATS_FILTER: {
            return state.setIn(['_internal', 'filters', action.name], fromJS(action.values))
        }

        default:
            return state
    }
}
