import { combineReducers, createReducer } from '@reduxjs/toolkit'

import knowledgeSourceArticleEditorReducer, {
    initialState as knowledgeSourceArticleEditorInitialState,
} from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { changeActiveTab, changeTicketMessage } from './actions'
import { TicketAIAgentFeedbackTab } from './constants'
import {
    TicketAIAgentFeedbackState,
    TicketDetailAIAgentFeedbackState,
} from './types'

const feedbackInitialState: TicketDetailAIAgentFeedbackState = {
    activeTab: TicketAIAgentFeedbackTab.CustomerInformation,
}

const feedbackReducer = createReducer<TicketDetailAIAgentFeedbackState>(
    feedbackInitialState,
    (builder) =>
        builder
            .addCase(changeActiveTab, (state, { payload }) => {
                state.activeTab = payload.activeTab
            })
            .addCase(changeTicketMessage, (state, { payload }) => {
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
