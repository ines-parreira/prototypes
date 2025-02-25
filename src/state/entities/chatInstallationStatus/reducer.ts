import { createReducer } from '@reduxjs/toolkit'

import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'

import {
    chatInstallationStatusFetched,
    resetChatInstallationStatus,
} from './actions'
import { ChatInstallationStatusState } from './types'

export const initialState: ChatInstallationStatusState = {
    installed: true,
    installedOnShopifyCheckout: true,
    minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
}

const chatInstallationStatus = createReducer<ChatInstallationStatusState>(
    initialState,
    (builder) =>
        builder
            .addCase(
                chatInstallationStatusFetched,
                (
                    state,
                    {
                        payload: {
                            installed,
                            installedOnShopifyCheckout,
                            minimumSnippetVersion,
                        },
                    },
                ) => {
                    state.installed = installed
                    state.installedOnShopifyCheckout =
                        !!installedOnShopifyCheckout
                    state.minimumSnippetVersion = minimumSnippetVersion
                },
            )
            .addCase(resetChatInstallationStatus, (state) => {
                state.installed = initialState.installed
                state.installedOnShopifyCheckout =
                    initialState.installedOnShopifyCheckout
                state.minimumSnippetVersion = initialState.minimumSnippetVersion
            }),
)

export default chatInstallationStatus
