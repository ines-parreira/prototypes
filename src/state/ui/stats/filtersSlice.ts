import {createSlice} from '@reduxjs/toolkit'

import {StatsFiltersWithLogicalOperator} from 'models/stat/types'
import {fromLegacyStatsFilters} from 'state/stats/utils'

export type FiltersSliceState = {
    isFilterDirty: boolean
    cleanStatsFilters: StatsFiltersWithLogicalOperator | null
}

export const initialState: FiltersSliceState = {
    isFilterDirty: false,
    cleanStatsFilters: null,
}

export const filtersSlice = createSlice({
    name: 'filters',
    initialState: initialState,
    reducers: {
        statFiltersDirty(state) {
            state.isFilterDirty = true
        },
        statFiltersClean(state) {
            state.isFilterDirty = false
        },
        statFiltersCleanWithPayload(state, {payload}) {
            state.isFilterDirty = false
            state.cleanStatsFilters = fromLegacyStatsFilters(payload)
        },
        statFiltersWithLogicalOperatorsCleanWithPayload(state, {payload}) {
            state.isFilterDirty = false
            state.cleanStatsFilters = payload
        },
    },
})
