import {createReducer} from '@reduxjs/toolkit'

import {HELP_CENTER_LANGUAGE_DEFAULT} from '../../../pages/settings/helpCenter/constants'

import {HelpCenterUiState} from './types'

import {changeHelpCenterId, changeViewLanguage} from './actions'

export const initialState: HelpCenterUiState = {
    currentLanguage: HELP_CENTER_LANGUAGE_DEFAULT,
    currentId: null,
}

export default createReducer<HelpCenterUiState>(initialState, (builder) =>
    builder
        .addCase(changeViewLanguage, (state, {payload}) => {
            state.currentLanguage = payload
        })
        .addCase(changeHelpCenterId, (state, {payload}) => {
            state.currentId = payload
        })
)
