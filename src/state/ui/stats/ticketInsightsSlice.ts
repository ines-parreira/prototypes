import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {OrderDirection} from 'models/api/types'
import {RootState} from 'state/types'

export enum ValueMode {
    TotalCount = 'totalCount',
    Percentage = 'percentage',
}

export type TicketInsightsState = {
    selectedCustomField: {
        id: number | null
        label: string
        isLoading: boolean
    }
    order: OrderDirection
    valueMode: ValueMode
}

export const initialState: TicketInsightsState = {
    selectedCustomField: {id: null, label: '', isLoading: true},
    order: OrderDirection.Asc,
    valueMode: ValueMode.TotalCount,
}

export const ticketInsightsSlice = createSlice({
    name: 'ticketInsights',
    initialState,
    reducers: {
        setSelectedCustomField(
            state,
            action: PayloadAction<TicketInsightsState['selectedCustomField']>
        ) {
            state.selectedCustomField = action.payload
            state.selectedCustomField = action.payload
        },
        toggleValueMode(state) {
            state.valueMode =
                state.valueMode === ValueMode.Percentage
                    ? ValueMode.TotalCount
                    : ValueMode.Percentage
        },
        toggleOrder(state) {
            state.order =
                state.order === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
        },
    },
})

export const {setSelectedCustomField, toggleOrder, toggleValueMode} =
    ticketInsightsSlice.actions

export const getSelectedCustomField = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].selectedCustomField

export const getValueMode = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].valueMode

export const getCustomFieldsOrder = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].order
