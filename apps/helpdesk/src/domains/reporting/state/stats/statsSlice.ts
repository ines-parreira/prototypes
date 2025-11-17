import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type {
    CustomFieldFilter,
    LegacyStatsFilters,
    Period,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    fromLegacyStatsFilters,
    fromPartialLegacyStatsFilters,
    getAdjustedAggregationWindow,
} from 'domains/reporting/state/stats/utils'

export const defaultStatsFilters: { period: Period } = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

export type StatsState = { filters: StatsFiltersWithLogicalOperator }
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
            if (state.filters[FilterKey.AggregationWindow]) {
                state.filters[FilterKey.AggregationWindow] =
                    getAdjustedAggregationWindow(state.filters)
            }
        },
        setStatsFiltersWithLogicalOperators(
            state,
            action: PayloadAction<StatsFiltersWithLogicalOperator>,
        ) {
            state.filters = action.payload
            if (state.filters[FilterKey.AggregationWindow]) {
                state.filters[FilterKey.AggregationWindow] =
                    getAdjustedAggregationWindow(state.filters)
            }
        },
        mergeStatsFilters(
            state,
            action: PayloadAction<Partial<LegacyStatsFilters>>,
        ) {
            Object.keys(action.payload).forEach(
                (filterKey) => delete state.filters[filterKey as FilterKey],
            )
            state.filters = {
                ...state.filters,
                ...fromPartialLegacyStatsFilters(action.payload),
                period: action.payload.period ?? state.filters.period,
            }
            if (state.filters[FilterKey.AggregationWindow]) {
                state.filters[FilterKey.AggregationWindow] =
                    getAdjustedAggregationWindow(state.filters)
            }
        },
        mergeStatsFiltersWithLogicalOperator(
            state,
            action: PayloadAction<Partial<StatsFiltersWithLogicalOperator>>,
        ) {
            state.filters = {
                ...state.filters,
                ...action.payload,
                period: action.payload.period ?? state.filters.period,
            }
            if (state.filters[FilterKey.AggregationWindow]) {
                state.filters[FilterKey.AggregationWindow] =
                    getAdjustedAggregationWindow(state.filters)
            }
        },
        mergeCustomFieldsFilter(
            state,
            action: PayloadAction<CustomFieldFilter>,
        ) {
            const { payload } = action
            if (
                state.filters.customFields?.find(
                    (filter) => filter.customFieldId === payload.customFieldId,
                )
            ) {
                state.filters.customFields = state.filters.customFields.map(
                    (customFieldFilter) =>
                        customFieldFilter.customFieldId ===
                        payload.customFieldId
                            ? payload
                            : customFieldFilter,
                )
            } else {
                state.filters.customFields = [
                    ...(state.filters.customFields ?? []),
                    payload,
                ]
            }
        },
    },
})

export const {
    resetStatsFilters,
    setStatsFilters,
    setStatsFiltersWithLogicalOperators,
    mergeStatsFilters,
    mergeStatsFiltersWithLogicalOperator,
    mergeCustomFieldsFilter,
} = statsSlice.actions
