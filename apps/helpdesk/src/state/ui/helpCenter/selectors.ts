import { createSelector } from 'reselect'

import type { StoreState } from 'state/types'

import type { HelpCenterState } from './types'

const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.ui.helpCenter

export const getViewLanguage = createSelector(
    getHelpCenterStore,
    (state) => state.currentLanguage,
)

export const getCurrentHelpCenterId = createSelector(
    getHelpCenterStore,
    (state) => state.currentId,
)
