import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {
    FilterKey,
    LegacyStatsFilters,
    Period,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {
    fromLegacyStatsFilters,
    fromPartialLegacyStatsFilters,
} from 'state/stats/utils'

export const defaultStatsFilters: {period: Period} = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

export type StatsState = {filters: StatsFiltersWithLogicalOperator}
export const initialState: StatsState = {
    filters: defaultStatsFilters,
}

export const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        resetStatsFilters(state) {
            state.filters = initialState.filters
        },
        setStatsFilters(state, action: PayloadAction<LegacyStatsFilters>) {
            state.filters = {
                ...fromLegacyStatsFilters(action.payload),
                period: action.payload.period,
            }
        },
        mergeStatsFilters(
            state,
            action: PayloadAction<Partial<LegacyStatsFilters>>
        ) {
            Object.keys(action.payload).forEach(
                (filterKey) => delete state.filters[filterKey as FilterKey]
            )
            state.filters = {
                ...state.filters,
                ...fromPartialLegacyStatsFilters(action.payload),
                period: action.payload.period ?? state.filters.period,
            }
        },
        mergeStatsFiltersWithLogicalOperator(
            state,
            action: PayloadAction<Partial<StatsFiltersWithLogicalOperator>>
        ) {
            state.filters = {
                ...state.filters,
                ...action.payload,
                period: action.payload.period ?? state.filters.period,
            }
        },
    },
})

export const {
    resetStatsFilters,
    setStatsFilters,
    mergeStatsFilters,
    mergeStatsFiltersWithLogicalOperator,
} = statsSlice.actions
