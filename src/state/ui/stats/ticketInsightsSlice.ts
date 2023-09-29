import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from 'state/types'

export type TicketInsightsState = {
    selectedCustomField: {
        id: number | null
        isLoading?: boolean
    }
}

export const initialState: TicketInsightsState = {
    selectedCustomField: {id: null, isLoading: true},
}

export const ticketInsightsSlice = createSlice({
    name: 'ticketInsights',
    initialState,
    reducers: {
        setSelectedCustomField(
            state,
            action: PayloadAction<TicketInsightsState['selectedCustomField']>
        ) {
            state.selectedCustomField.id = action.payload.id
            state.selectedCustomField.isLoading = action.payload.isLoading
        },
    },
})

export const {setSelectedCustomField} = ticketInsightsSlice.actions

export const getSelectedCustomField = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].selectedCustomField
