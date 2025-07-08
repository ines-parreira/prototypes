import { PayloadActionCreator } from '@reduxjs/toolkit'

import { TicketMessage } from 'models/ticket/types'
import { KnowledgeSourceArticleEditorState } from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

import { TicketAIAgentFeedbackTab } from './constants'

export enum UIActions {
    ChangeActiveTab = 'CHANGE_ACTIVE_TAB',
    ChangeTicketMessage = 'CHANGE_TICKET_MESSAGE',
}

export type ChangeActiveTabAction = PayloadActionCreator<
    string,
    UIActions.ChangeActiveTab
>

export type TicketDetailAIAgentFeedbackState = {
    activeTab: TicketAIAgentFeedbackTab
    message?: TicketMessage
}

export type TicketAIAgentFeedbackState = {
    feedback: TicketDetailAIAgentFeedbackState
    knowledgeSourceArticleEditor: KnowledgeSourceArticleEditorState
}
