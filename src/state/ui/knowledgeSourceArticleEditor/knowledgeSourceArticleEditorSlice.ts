import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { OptionItem } from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import { KnowledgePendingCloseType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { RootState } from 'state/types'

export type KnowledgeSourceArticleEditorState = {
    pendingClose: KnowledgePendingCloseType | null
    pendingDeleteLocaleOptionItem: OptionItem | undefined
    counters: { charCount: number } | undefined
    lastProcessedArticleId: number | null
    isConsideredMissingKnowledge: boolean
}

export const initialState: KnowledgeSourceArticleEditorState = {
    pendingClose: null,
    pendingDeleteLocaleOptionItem: undefined,
    counters: undefined,
    lastProcessedArticleId: null,
    isConsideredMissingKnowledge: true,
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
        setIsConsideredMissingKnowledge(state, action: PayloadAction<boolean>) {
            state.isConsideredMissingKnowledge = action.payload
        },
        resetState(state) {
            state.pendingClose = initialState.pendingClose
            state.pendingDeleteLocaleOptionItem =
                initialState.pendingDeleteLocaleOptionItem
            state.counters = initialState.counters
            state.lastProcessedArticleId = initialState.lastProcessedArticleId
            state.isConsideredMissingKnowledge =
                initialState.isConsideredMissingKnowledge
        },
    },
})

export const {
    setPendingClose,
    setPendingDeleteLocaleOptionItem,
    setCounters,
    setLastProcessedArticleId,
    setIsConsideredMissingKnowledge,
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

export const getIsConsideredMissingKnowledge = (state: RootState) =>
    state.ui.ticketAIAgentFeedback.knowledgeSourceArticleEditor
        .isConsideredMissingKnowledge

export default knowledgeSourceArticleEditorSlice.reducer
