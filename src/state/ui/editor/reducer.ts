import {createReducer} from '@reduxjs/toolkit'

import {linkEditionStarted, linkEditionEnded, editorFocused} from './actions'
import {EditorState} from './types'

export const initialState = {
    isEditingLink: false,
    isFocused: false,
}

const statsReducer = createReducer<EditorState>(initialState, (builder) =>
    builder
        .addCase(linkEditionStarted, (state) => {
            state.isEditingLink = true
        })
        .addCase(linkEditionEnded, (state) => {
            state.isEditingLink = false
        })
        .addCase(editorFocused, (state, {payload}) => {
            state.isFocused = payload
        })
)

export default statsReducer
