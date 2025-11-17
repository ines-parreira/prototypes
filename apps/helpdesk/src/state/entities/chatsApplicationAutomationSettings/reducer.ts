import { createReducer } from '@reduxjs/toolkit'

import type { ChatApplicationAutomationSettings } from '../../../models/chatApplicationAutomationSettings/types'
import {
    chatApplicationAutomationSettingsFetched,
    chatApplicationAutomationSettingsUpdated,
    chatsApplicationAutomationSettingsFetched,
} from './actions'
import type { ChatsApplicationAutomationSettingsState } from './types'

export const initialState: ChatsApplicationAutomationSettingsState = {}

const chatsApplicationAutomationSettingsReducer =
    createReducer<ChatsApplicationAutomationSettingsState>(
        initialState,
        (builder) =>
            builder
                .addCase(
                    chatsApplicationAutomationSettingsFetched,
                    (state, { payload }) => {
                        payload.map(
                            (
                                chatApplicationAutomationSettings: ChatApplicationAutomationSettings,
                            ) => {
                                state[
                                    chatApplicationAutomationSettings.applicationId.toString()
                                ] = chatApplicationAutomationSettings
                            },
                        )
                    },
                )
                .addCase(
                    chatApplicationAutomationSettingsFetched,
                    (state, { payload }) => {
                        state[payload.applicationId.toString()] = payload
                    },
                )
                .addCase(
                    chatApplicationAutomationSettingsUpdated,
                    (state, { payload }) => {
                        state[payload.applicationId.toString()] = payload
                    },
                ),
    )

export default chatsApplicationAutomationSettingsReducer
