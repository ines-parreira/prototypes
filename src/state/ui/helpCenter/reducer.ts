import {createReducer} from '@reduxjs/toolkit'

import {HelpCenterState} from './types'

import {changeHelpCenterId, changeViewLanguage} from './actions'

export const initialState: HelpCenterState = {
    currentLanguage: null,
    currentId: null,
}

export default createReducer<HelpCenterState>(initialState, (builder) =>
    builder
        .addCase(changeViewLanguage, (state, {payload}) => {
            state.currentLanguage = payload
        })
        .addCase(changeHelpCenterId, (state, {payload}) => {
            state.currentId = payload
        })
)
