// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const initialState = fromJS({
    filters: null,
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case constants.RESET_STATS_FILTERS:
            return state.set('filters', null)

        case constants.SET_STATS_FILTERS:
            return state.set('filters', action.filters)

        case constants.MERGE_STATS_FILTERS:
            return state.mergeIn(['filters'], action.filters)

        default:
            return state
    }
}
