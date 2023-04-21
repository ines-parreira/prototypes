import {createReducer} from '@reduxjs/toolkit'
import {GorgiasChatMinimumSnippetVersion} from 'models/integration/types'
import {ChatInstallationStatusState} from './types'
import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from './actions'

export const initialState: ChatInstallationStatusState = {
    installed: true,
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
}

const chatInstallationStatus = createReducer<ChatInstallationStatusState>(
    initialState,
    (builder) =>
        builder
            .addCase(
                chatInstallationStatusFetched,
                (state, {payload: {installed, minimumSnippetVersion}}) => {
                    state.installed = installed
                    state.minimumSnippetVersion = minimumSnippetVersion
                }
            )
            .addCase(resetChatInstallationStatus, (state) => {
                state.installed = initialState.installed
                state.minimumSnippetVersion = initialState.minimumSnippetVersion
            })
)

export default chatInstallationStatus
