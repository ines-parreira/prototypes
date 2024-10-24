import {createSlice, PayloadAction} from '@reduxjs/toolkit'

import {opposite, OrderDirection} from 'models/api/types'
import {RootState} from 'state/types'

import {ValueMode} from 'state/ui/stats/types'

export type TagsTableOrder = {
    direction: OrderDirection
    column: 'tag' | 'total' | number
}

export type TagsReportState = {
    order: TagsTableOrder
    valueMode: ValueMode
    heatmapMode: boolean
}

export const initialState: TagsReportState = {
    order: {
        direction: OrderDirection.Asc,
        column: 'tag',
    },
    valueMode: ValueMode.TotalCount,
    heatmapMode: false,
}

export const tagsReportSlice = createSlice({
    name: 'tagsReport',
    initialState,
    reducers: {
        toggleValueMode(state) {
            state.valueMode =
                state.valueMode === ValueMode.Percentage
                    ? ValueMode.TotalCount
                    : ValueMode.Percentage
        },
        setOrder(
            state,
            action: PayloadAction<{column: TagsTableOrder['column']}>
        ) {
            state.order = {
                column: action.payload.column,
                direction:
                    action.payload.column === state.order.column
                        ? opposite(state.order.direction)
                        : action.payload.column === 'tag'
                          ? OrderDirection.Asc
                          : OrderDirection.Desc,
            }
        },
        toggleHeatmapMode(state) {
            state.heatmapMode = !state.heatmapMode
        },
    },
})

export const {setOrder, toggleValueMode, toggleHeatmapMode} =
    tagsReportSlice.actions

export const getValueMode = (state: RootState) =>
    state.ui.stats[tagsReportSlice.name].valueMode

export const getTagsOrder = (state: RootState) =>
    state.ui.stats[tagsReportSlice.name].order

export const getHeatmapMode = (state: RootState) =>
    state.ui.stats[tagsReportSlice.name].heatmapMode
