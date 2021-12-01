import {fromJS} from 'immutable'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {StatsState} from './types'

export const initialState: StatsState = fromJS({
    filters: null,
})

export default function reducer(
    state: StatsState = initialState,
    action: GorgiasAction
): StatsState {
    switch (action.type) {
        case constants.RESET_STATS_FILTERS:
            return state.set('filters', null)

        case constants.SET_STATS_FILTERS:
            return state.set('filters', action.filters)

        case constants.MERGE_STATS_FILTERS:
            return state.mergeIn(['filters'], action.filters as any)

        default:
            return state
    }
}
