import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from 'state/types'

export type TicketInsightsState = {
    selectedCustomFieldId: number | null
}

export const initialState: TicketInsightsState = {
    selectedCustomFieldId: null,
}

export const ticketInsightsSlice = createSlice({
    name: 'ticketInsights',
    initialState,
    reducers: {
        setSelectedCustomFieldId(state, action: PayloadAction<number | null>) {
            state.selectedCustomFieldId = action.payload
        },
    },
})

export const {setSelectedCustomFieldId} = ticketInsightsSlice.actions

export const getSelectedCustomFieldId = (state: RootState) =>
    state.ui[ticketInsightsSlice.name].selectedCustomFieldId
