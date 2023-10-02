import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {OrderDirection} from 'models/api/types'
import {RootState} from 'state/types'

export type TicketInsightsState = {
    selectedCustomField: {
        id: number | null
        label: string
        isLoading: boolean
    }
    order: OrderDirection
}

export const initialState: TicketInsightsState = {
    selectedCustomField: {id: null, label: '', isLoading: true},
    order: OrderDirection.Asc,
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
        },
        toggleOrder(state) {
            state.order =
                state.order === OrderDirection.Asc
                    ? OrderDirection.Desc
                    : OrderDirection.Asc
        },
    },
})

export const {setSelectedCustomField, toggleOrder} = ticketInsightsSlice.actions

export const getSelectedCustomField = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].selectedCustomField

export const getCustomFieldsOrder = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].order
