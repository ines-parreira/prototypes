import {createSelector} from 'reselect'

import {readHelpCenterStore} from '../selectors'

export const getHelpCenterUiState = createSelector(
    readHelpCenterStore,
    (store) => store.ui
)

export const readViewLanguage = createSelector(
    getHelpCenterUiState,
    (state) => state.currentLanguage
)

export const getCurrentHelpCenterId = createSelector(
    getHelpCenterUiState,
    (state) => state.currentId
)
