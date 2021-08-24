import {createReducer} from '@reduxjs/toolkit'

import {HELP_CENTER_LANGUAGE_DEFAULT} from '../../../pages/settings/helpCenter/constants'

import {HelpCenterUiState} from './types'

import {changeViewLanguage} from './actions'

export const initialState: HelpCenterUiState = {
    currentLanguage: HELP_CENTER_LANGUAGE_DEFAULT,
}

export default createReducer<HelpCenterUiState>(initialState, (builder) =>
    builder.addCase(changeViewLanguage, (state, {payload}) => {
        state.currentLanguage = payload
    })
)
