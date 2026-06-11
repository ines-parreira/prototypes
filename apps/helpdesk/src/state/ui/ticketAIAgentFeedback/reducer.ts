import { combineReducers, createReducer } from '@reduxjs/toolkit'

import {
    initialState as knowledgeSourceArticleEditorInitialState,
    DefaultExportKnowledgeSourceArticleEditorSlice as knowledgeSourceArticleEditorReducer,
} from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { changeTicketMessage } from './actions'
import type {
    TicketAIAgentFeedbackState,
    TicketDetailAIAgentFeedbackState,
} from './types'

const feedbackInitialState: TicketDetailAIAgentFeedbackState = {}

const feedbackReducer = createReducer<TicketDetailAIAgentFeedbackState>(
    feedbackInitialState,
    (builder) =>
        builder.addCase(changeTicketMessage, (state, { payload }) => {
            state.message = payload.message
        }),
)

export const initialState: TicketAIAgentFeedbackState = {
    feedback: feedbackInitialState,
    knowledgeSourceArticleEditor: knowledgeSourceArticleEditorInitialState,
}

const DefaultExportReducer = combineReducers({
    feedback: feedbackReducer,
    knowledgeSourceArticleEditor: knowledgeSourceArticleEditorReducer,
})

export { DefaultExportReducer }
