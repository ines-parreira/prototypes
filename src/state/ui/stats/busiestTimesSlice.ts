import {createSlice, PayloadAction} from '@reduxjs/toolkit'

import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {metrics} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {RootState} from 'state/types'

export type BusiestTimesState = {
    selectedMetric: BusiestTimeOfDaysMetrics
}

export const initialState: BusiestTimesState = {
    selectedMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
}

export const busiestTimesSlice = createSlice({
    name: 'busiestTimes',
    initialState,
    reducers: {
        setSelectedMetric(state, action: PayloadAction<string>) {
            const metric = metrics.find(
                (metric) => String(metric) === action.payload
            )
            if (metric) {
                state.selectedMetric = metric
            }
        },
    },
})

export const {setSelectedMetric} = busiestTimesSlice.actions

export const getSelectedMetric = (state: RootState) =>
    state.ui.stats[busiestTimesSlice.name].selectedMetric
