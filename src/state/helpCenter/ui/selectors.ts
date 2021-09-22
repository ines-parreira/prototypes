import {createSelector} from 'reselect'

import {getHelpCenterStore} from '../selectors'

export const getHelpCenterUiState = createSelector(
    getHelpCenterStore,
    (store) => store.ui
)

export const getViewLanguage = createSelector(
    getHelpCenterUiState,
    (state) => state.currentLanguage
)

export const getCurrentHelpCenterId = createSelector(
    getHelpCenterUiState,
    (state) => state.currentId
)
