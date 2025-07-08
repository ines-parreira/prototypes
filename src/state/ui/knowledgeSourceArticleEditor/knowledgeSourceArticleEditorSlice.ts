import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OptionItem } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import { KnowledgePendingCloseType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { RootState } from 'state/types'

export type KnowledgeSourceArticleEditorState = {
    pendingClose: KnowledgePendingCloseType | null
    pendingDeleteLocaleOptionItem: OptionItem | undefined
    counters: { charCount: number } | undefined
    lastProcessedArticleId: number | null
}

export const initialState: KnowledgeSourceArticleEditorState = {
    pendingClose: null,
    pendingDeleteLocaleOptionItem: undefined,
    counters: undefined,
    lastProcessedArticleId: null,
}

export const knowledgeSourceArticleEditorSlice = createSlice({
    name: 'knowledgeSourceArticleEditor',
    initialState,
    reducers: {
        setPendingClose(
            state,
            action: PayloadAction<KnowledgePendingCloseType | null>,
        ) {
            state.pendingClose = action.payload
        },
        setPendingDeleteLocaleOptionItem(
            state,
            action: PayloadAction<OptionItem | undefined>,
        ) {
            state.pendingDeleteLocaleOptionItem = action.payload
        },
        setCounters(
            state,
            action: PayloadAction<{ charCount: number } | undefined>,
        ) {
            state.counters = action.payload
        },
        setLastProcessedArticleId(state, action: PayloadAction<number | null>) {
            state.lastProcessedArticleId = action.payload
        },
        resetState(state) {
            state.pendingClose = initialState.pendingClose
            state.pendingDeleteLocaleOptionItem =
                initialState.pendingDeleteLocaleOptionItem
            state.counters = initialState.counters
            state.lastProcessedArticleId = initialState.lastProcessedArticleId
        },
    },
})

export const {
    setPendingClose,
    setPendingDeleteLocaleOptionItem,
    setCounters,
    setLastProcessedArticleId,
    resetState,
} = knowledgeSourceArticleEditorSlice.actions

export const getKnowledgeSourceArticleEditorState = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor

export const getPendingClose = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor.pendingClose

export const getPendingDeleteLocaleOptionItem = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor
        .pendingDeleteLocaleOptionItem

export const getCounters = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor.counters

export const getLastProcessedArticleId = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor
        .lastProcessedArticleId

export default knowledgeSourceArticleEditorSlice.reducer
