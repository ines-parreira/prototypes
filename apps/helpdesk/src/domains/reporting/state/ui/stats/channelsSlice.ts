import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

type ChannelsSorting = {
    field: ChannelsTableColumns
    direction: OrderDirection
}

export type ChannelsSlice = {
    sorting: ChannelsSorting & {
        isLoading: boolean
        lastSortingMetric: string[] | null
    }
    heatmapMode: boolean
}

export const initialState: ChannelsSlice = {
    sorting: {
        field: ChannelsTableColumns.Channel,
        direction: OrderDirection.Asc,
        isLoading: false,
        lastSortingMetric: null,
    },
    heatmapMode: false,
}

export const channelsSlice = createSlice({
    name: 'channels',
    initialState,
    reducers: {
        toggleHeatmapMode(state) {
            state.heatmapMode = !state.heatmapMode
        },
        sortingSet(state, action: PayloadAction<ChannelsSorting>) {
            state.sorting.field = action.payload.field
            state.sorting.direction = action.payload.direction
            state.sorting.isLoading = true
        },
        sortingLoading(state) {
            state.sorting.isLoading = true
        },
        sortingLoaded(state, action: PayloadAction<string[] | null>) {
            state.sorting.isLoading = false
            state.sorting.lastSortingMetric = action.payload
        },
    },
})

export const { toggleHeatmapMode, sortingSet, sortingLoading, sortingLoaded } =
    channelsSlice.actions

export const getHeatmapMode = (state: RootState) =>
    state.ui.stats[channelsSlice.name].heatmapMode

export const getChannelsSorting = (state: RootState) =>
    state.ui.stats[channelsSlice.name].sorting
