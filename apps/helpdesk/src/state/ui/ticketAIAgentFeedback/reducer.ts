import { combineReducers, createReducer } from '@reduxjs/toolkit'

import knowledgeSourceArticleEditorReducer, {
    initialState as knowledgeSourceArticleEditorInitialState,
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

export default combineReducers({
    feedback: feedbackReducer,
    knowledgeSourceArticleEditor: knowledgeSourceArticleEditorReducer,
})
