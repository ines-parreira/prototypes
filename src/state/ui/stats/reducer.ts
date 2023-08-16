import {createReducer} from '@reduxjs/toolkit'

import {
    fetchStatEnded,
    fetchStatStarted,
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersDirty,
} from './actions'
import {StatsState} from './types'

export const initialState = {
    fetchingMap: {},
    isFilterDirty: false,
    cleanStatsFilters: null,
}

const statsReducer = createReducer<StatsState>(initialState, (builder) =>
    builder
        .addCase(
            fetchStatEnded,
            (state, {payload: {statName, resourceName}}) => {
                state.fetchingMap[`${statName}/${resourceName}`] = false
            }
        )
        .addCase(
            fetchStatStarted,
            (state, {payload: {statName, resourceName}}) => {
                state.fetchingMap[`${statName}/${resourceName}`] = true
            }
        )
        .addCase(statFiltersDirty, (state) => {
            state.isFilterDirty = true
        })
        .addCase(statFiltersClean, (state) => {
            state.isFilterDirty = false
        })
        .addCase(statFiltersCleanWithPayload, (state, {payload}) => {
            state.isFilterDirty = false
            state.cleanStatsFilters = payload
        })
)

export default statsReducer
