import {createReducer} from '@reduxjs/toolkit'
import {ChatInstallationStatusState} from './types'
import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from './actions'

export const initialState: ChatInstallationStatusState = {
    installed: true,
}

const chatInstallationStatus = createReducer<ChatInstallationStatusState>(
    initialState,
    (builder) =>
        builder
            .addCase(chatInstallationStatusFetched, (state, {payload}) => {
                state.installed = payload.installed
            })
            .addCase(resetChatInstallationStatus, (state) => {
                state.installed = initialState.installed
            })
)

export default chatInstallationStatus
