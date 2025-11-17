import { createReducer } from '@reduxjs/toolkit'

import { editorFocused, linkEditionEnded, linkEditionStarted } from './actions'
import type { EditorState } from './types'

export const initialState = {
    isEditingLink: false,
    isFocused: false,
}

export default createReducer<EditorState>(initialState, (builder) =>
    builder
        .addCase(linkEditionStarted, (state) => {
            state.isEditingLink = true
        })
        .addCase(linkEditionEnded, (state) => {
            state.isEditingLink = false
        })
        .addCase(editorFocused, (state, { payload }) => {
            state.isFocused = payload
        }),
)
