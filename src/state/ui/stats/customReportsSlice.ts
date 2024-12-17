import {createSlice, PayloadAction} from '@reduxjs/toolkit'

import {AnalyticsCustomReport} from 'models/stat/types'

export type CustomReportsSliceState = {
    customReports: AnalyticsCustomReport | null
}

const initialState: CustomReportsSliceState = {
    customReports: null,
}

export const customReportsSlice = createSlice({
    name: 'customReports',
    initialState,
    reducers: {
        createCustomReport: (
            state,
            action: PayloadAction<AnalyticsCustomReport>
        ) => {
            state.customReports = action.payload
        },
        updateCustomReport: (
            state,
            action: PayloadAction<{
                id: number
                updatedReport: Partial<AnalyticsCustomReport>
            }>
        ) => {
            const {id, updatedReport} = action.payload
            if (state.customReports?.id === id) {
                state.customReports = {
                    ...state.customReports,
                    ...updatedReport,
                }
            }
        },
        duplicateCustomReport: (state, action: PayloadAction<number>) => {
            const id = action.payload
            if (state.customReports?.id === id) {
                const newReport = {
                    ...state.customReports,
                    id: state.customReports.id + 1,
                }
                state.customReports = newReport
            }
        },
        removeCustomReport: (state, action: PayloadAction<number>) => {
            const id = action.payload
            if (state.customReports?.id === id) {
                state.customReports = null
            }
        },
    },
})

export const {
    createCustomReport,
    updateCustomReport,
    duplicateCustomReport,
    removeCustomReport,
} = customReportsSlice.actions

export default customReportsSlice.reducer
