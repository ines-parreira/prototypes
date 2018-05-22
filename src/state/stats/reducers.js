// @flow
import {fromJS} from 'immutable'
import * as constants from './constants'

import type {Map} from 'immutable'
import type {actionType} from '../types'

export const initialState = fromJS({
    _internal: {
        loading: {},
        meta: {},
        filters: {}
    }
})

export default (state: Map<*,*> = initialState, action: actionType): Map<*,*> => {
    switch (action.type) {
        case constants.FETCH_STATS_SUCCESS:
            return state.set(action.name, fromJS({
                'meta': action.resp.meta,
                ...action.resp.data
            }))

        case constants.SET_STATS_META:
            return state.setIn(['_internal', 'meta'], fromJS(action.meta))

        case constants.SET_STATS_FILTERS:
            return state.setIn(['_internal', 'filters'], fromJS(action.filters))

        default:
            return state
    }
}
