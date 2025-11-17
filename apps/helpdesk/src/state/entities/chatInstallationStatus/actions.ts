import { createAction } from '@reduxjs/toolkit'

import {
    CHAT_INSTALLATION_STATUS_FETCHED,
    RESET_CHAT_INSTALLATION_STATUS,
} from './constants'
import type { ChatInstallationStatusState } from './types'

export const chatInstallationStatusFetched =
    createAction<ChatInstallationStatusState>(CHAT_INSTALLATION_STATUS_FETCHED)

export const resetChatInstallationStatus = createAction(
    RESET_CHAT_INSTALLATION_STATUS,
)
