import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {StatsFilters} from 'models/stat/types'

export const defaultStatsFilters: StatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

export type StatsState = {filters: StatsFilters}
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
        setStatsFilters(state, action: PayloadAction<StatsFilters>) {
            state.filters = action.payload
        },
        mergeStatsFilters(state, action: PayloadAction<Partial<StatsFilters>>) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            }
        },
    },
})

export const {resetStatsFilters, setStatsFilters, mergeStatsFilters} =
    statsSlice.actions
