import {createReducer} from '@reduxjs/toolkit'

import {HelpCenterUiState} from './types'

import {changeHelpCenterId, changeViewLanguage} from './actions'

export const initialState: HelpCenterUiState = {
    currentLanguage: null,
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
