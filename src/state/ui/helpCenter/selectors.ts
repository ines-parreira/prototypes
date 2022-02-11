import {createSelector} from 'reselect'
import {StoreState} from 'state/types'
import {HelpCenterState} from './types'

const getHelpCenterStore = (state: StoreState): HelpCenterState =>
    state.ui.helpCenter

export const getViewLanguage = createSelector(
    getHelpCenterStore,
    (state) => state.currentLanguage
)

export const getCurrentHelpCenterId = createSelector(
    getHelpCenterStore,
    (state) => state.currentId
)
