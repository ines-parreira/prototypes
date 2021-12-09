import {Map} from 'immutable'

import {StoreDispatch} from '../types'

import * as constants from './constants'

export const setStatsFilters = (filters: Map<any, any>) => {
    return {
        type: constants.SET_STATS_FILTERS,
        filters,
    }
}

export const mergeStatsFilters = (filters: Map<any, any>) => {
    return {
        type: constants.MERGE_STATS_FILTERS,
        filters,
    }
}

export const resetStatsFilters = () => {
    return {type: constants.RESET_STATS_FILTERS}
}

export const setStat = (
    name: string,
    stat: Map<any, any>
): ReturnType<StoreDispatch> => {
    return {
        type: constants.SET_STAT,
        name,
        stat,
    }
}
