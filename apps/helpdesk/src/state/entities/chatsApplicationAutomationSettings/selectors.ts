import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '../../types'

export const getChatsApplicationAutomationSettings = createSelector(
    (state: RootState) => state.entities.chatsApplicationAutomationSettings,
    (chatsApplicationAutomationSettings) => chatsApplicationAutomationSettings,
)
