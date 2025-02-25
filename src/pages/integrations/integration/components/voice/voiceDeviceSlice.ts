import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Call, Device } from '@twilio/voice-sdk'

import { initialState } from 'state/twilio/voiceDevice'

const slice = createSlice({
    name: 'voiceDevice',
    initialState,
    reducers: {
        setDevice: (state, action: PayloadAction<Device | null>) => {
            state.device = action.payload
        },
        setCall: (state, action: PayloadAction<Call | null>) => {
            state.call = action.payload
        },
        setIsRinging: (state, action: PayloadAction<boolean>) => {
            state.isRinging = action.payload
        },
        setIsDialing: (state, action: PayloadAction<boolean>) => {
            state.isDialing = action.payload
        },
        setIsConnecting: (
            state,
            action: PayloadAction<boolean | undefined>,
        ) => {
            state.isConnecting = action.payload
        },
        setError: (state, action: PayloadAction<Error | null>) => {
            state.error = action.payload
        },
        setWarning: (state, action: PayloadAction<string | null>) => {
            state.warning = action.payload
        },
        setReconnectAttempts: (state, action: PayloadAction<number>) => {
            state.reconnectAttempts = action.payload
        },
        incrementReconnectAttempts: (state) => {
            state.reconnectAttempts += 1
        },
        resetReconnectAttempts: (state) => {
            state.reconnectAttempts = 0
        },
    },
})

export default slice
