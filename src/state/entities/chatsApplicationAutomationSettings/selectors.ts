import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '../../types'

export const getChatsApplicationAutomationSettings = createSelector(
    (state: RootState) => state.entities.chatsApplicationAutomationSettings,
    (chatsApplicationAutomationSettings) => chatsApplicationAutomationSettings,
)
