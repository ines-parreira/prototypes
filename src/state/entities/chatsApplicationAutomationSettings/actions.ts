import {createAction} from '@reduxjs/toolkit'

import {ChatApplicationAutomationSettings} from '../../../models/chatApplicationAutomationSettings/types'

import {
    CHATS_APPLICATION_AUTOMATION_SETTINGS_FETCHED,
    CHAT_APPLICATION_AUTOMATION_SETTINGS_FETCHED,
    CHAT_APPLICATION_AUTOMATION_SETTINGS_UPDATED,
} from './constants'

export const chatApplicationAutomationSettingsUpdated =
    createAction<ChatApplicationAutomationSettings>(
        CHAT_APPLICATION_AUTOMATION_SETTINGS_UPDATED
    )
export const chatApplicationAutomationSettingsFetched =
    createAction<ChatApplicationAutomationSettings>(
        CHAT_APPLICATION_AUTOMATION_SETTINGS_FETCHED
    )
export const chatsApplicationAutomationSettingsFetched = createAction<
    ChatApplicationAutomationSettings[]
>(CHATS_APPLICATION_AUTOMATION_SETTINGS_FETCHED)
