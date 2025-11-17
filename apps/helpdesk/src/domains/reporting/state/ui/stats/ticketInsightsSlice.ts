import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { ValueMode } from 'domains/reporting/state/ui/stats/types'
import { OrderDirection } from 'models/api/types'
import type { RootState } from 'state/types'

export type TicketInsightsOrder = {
    direction: OrderDirection
    column: 'total' | 'label' | number
}

export type TicketInsightsState = {
    selectedCustomField: {
        id: number | null
        label: string
        isLoading: boolean
    }
    order: TicketInsightsOrder
    valueMode: ValueMode
    heatmapMode: boolean
}

export const initialState: TicketInsightsState = {
    selectedCustomField: { id: null, label: '', isLoading: true },
    order: {
        direction: OrderDirection.Asc,
        column: 'label',
    },
    valueMode: ValueMode.TotalCount,
    heatmapMode: false,
}

export const ticketInsightsSlice = createSlice({
    name: 'ticketInsights',
    initialState,
    reducers: {
        setSelectedCustomField(
            state,
            action: PayloadAction<TicketInsightsState['selectedCustomField']>,
        ) {
            state.selectedCustomField = action.payload
        },
        toggleValueMode(state) {
            state.valueMode =
                state.valueMode === ValueMode.Percentage
                    ? ValueMode.TotalCount
                    : ValueMode.Percentage
        },
        setOrder(
            state,
            action: PayloadAction<{ column: TicketInsightsOrder['column'] }>,
        ) {
            state.order = {
                column: action.payload.column,
                direction:
                    action.payload.column === state.order.column
                        ? state.order.direction === OrderDirection.Asc
                            ? OrderDirection.Desc
                            : OrderDirection.Asc
                        : action.payload.column === 'label'
                          ? OrderDirection.Asc
                          : OrderDirection.Desc,
            }
        },
        toggleHeatmapMode(state) {
            state.heatmapMode = !state.heatmapMode
        },
    },
})

export const {
    setSelectedCustomField,
    setOrder,
    toggleValueMode,
    toggleHeatmapMode,
} = ticketInsightsSlice.actions

export const getSelectedCustomField = (state: RootState) =>
    state.ui.stats[ticketInsightsSlice.name].selectedCustomField

export const getValueMode = (state: RootState) =>
    state.ui.stats[ticketInsightsSlice.name].valueMode

export const getCustomFieldsOrder = (state: RootState) =>
    state.ui.stats[ticketInsightsSlice.name].order

export const getHeatmapMode = (state: RootState) =>
    state.ui.stats[ticketInsightsSlice.name].heatmapMode
