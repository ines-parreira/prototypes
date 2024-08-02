import {createReducer} from '@reduxjs/toolkit'
import {fromLegacyStatsFilters} from 'state/stats/utils'

import {
    fetchStatEnded,
    fetchStatStarted,
    statFiltersClean,
    statFiltersCleanWithPayload,
    statFiltersDirty,
    statFiltersWithLogicalOperatorsCleanWithPayload,
} from 'state/ui/stats/actions'
import {StatsState} from 'state/ui/stats/types'

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
            state.cleanStatsFilters = fromLegacyStatsFilters(payload)
        })
        .addCase(
            statFiltersWithLogicalOperatorsCleanWithPayload,
            (state, {payload}) => {
                state.isFilterDirty = false
                state.cleanStatsFilters = payload
            }
        )
)

export default statsReducer
