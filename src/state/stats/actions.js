// @flow

import type {actionType} from '../types'

import * as constants from './constants'

export const setStatsFilters = (filters: Map<*, *>): actionType => {
    return {
        type: constants.SET_STATS_FILTERS,
        filters,
    }
}

export const mergeStatsFilters = (filters: Map<*, *>): actionType => {
    return {
        type: constants.MERGE_STATS_FILTERS,
        filters,
    }
}

export const resetStatsFilters = (): actionType => {
    return {type: constants.RESET_STATS_FILTERS}
}

export const setStat = (name: string, stat: Map<*, *>) => {
    return {
        type: constants.SET_STAT,
        name,
        stat,
    }
}
