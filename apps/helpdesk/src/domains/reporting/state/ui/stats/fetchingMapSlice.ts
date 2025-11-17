import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type FetchingMapSliceState = Record<string, boolean | undefined>

export const initialState: FetchingMapSliceState = {}

export const fetchingMapSlice = createSlice({
    name: 'fetchingMap',
    initialState: initialState,
    reducers: {
        fetchStatEnded(
            state,
            action: PayloadAction<{ statName: string; resourceName: string }>,
        ) {
            state[`${action.payload.statName}/${action.payload.resourceName}`] =
                false
        },
        fetchStatStarted(
            state,
            action: PayloadAction<{ statName: string; resourceName: string }>,
        ) {
            state[`${action.payload.statName}/${action.payload.resourceName}`] =
                true
        },
    },
})

export const { fetchStatEnded, fetchStatStarted } = fetchingMapSlice.actions
