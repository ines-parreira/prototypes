import {fromJS} from 'immutable'

import {StatsFilters} from 'models/stat/types'

import * as constants from './constants'

export const setStatsFilters = (filters: StatsFilters) => {
    return {
        type: constants.SET_STATS_FILTERS,
        filters: fromJS(filters),
    }
}

export const mergeStatsFilters = (filters: Partial<StatsFilters>) => {
    return {
        type: constants.MERGE_STATS_FILTERS,
        filters: fromJS(filters),
    }
}

export const resetStatsFilters = () => {
    return {type: constants.RESET_STATS_FILTERS}
}
