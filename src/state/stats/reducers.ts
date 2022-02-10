import {fromJS} from 'immutable'

import {StatsFilters} from 'models/stat/types'

import {GorgiasAction} from '../types'

import * as constants from './constants'
import {StatsState} from './types'

export const defaultStatsFilters: StatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

export const initialState: StatsState = fromJS({
    filters: defaultStatsFilters,
})

export default function reducer(
    state: StatsState = initialState,
    action: GorgiasAction
): StatsState {
    switch (action.type) {
        case constants.RESET_STATS_FILTERS:
            return state.set('filters', fromJS(defaultStatsFilters))

        case constants.SET_STATS_FILTERS:
            return state.set('filters', action.filters)

        case constants.MERGE_STATS_FILTERS:
            return state.mergeIn(['filters'], action.filters as any)

        default:
            return state
    }
}
