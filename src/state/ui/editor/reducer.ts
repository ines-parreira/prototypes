import {createReducer} from '@reduxjs/toolkit'

import {linkEditionStarted, linkEditionEnded} from './actions'
import {EditorState} from './types'

export const initialState = {
    isEditingLink: false,
}

const statsReducer = createReducer<EditorState>(initialState, (builder) =>
    builder
        .addCase(linkEditionStarted, (state) => {
            state.isEditingLink = true
        })
        .addCase(linkEditionEnded, (state) => {
            state.isEditingLink = false
        })
)

export default statsReducer
