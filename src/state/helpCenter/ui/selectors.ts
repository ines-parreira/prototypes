import {createSelector} from 'reselect'

import {readHelpCenterStore} from '../selectors'

export const readHelpCenterUiState = createSelector(
    readHelpCenterStore,
    (store) => store.ui
)

export const readViewLanguage = createSelector(
    readHelpCenterUiState,
    (state) => state.currentLanguage
)
