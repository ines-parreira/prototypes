import type { TicketMessage } from 'models/ticket/types'
import type { KnowledgeSourceArticleEditorState } from 'state/ui/knowledgeSourceArticleEditor/knowledgeSourceArticleEditorSlice'

export enum UIActions {
    ChangeTicketMessage = 'CHANGE_TICKET_MESSAGE',
}

export type TicketDetailAIAgentFeedbackState = {
    message?: TicketMessage
}

export type TicketAIAgentFeedbackState = {
    feedback: TicketDetailAIAgentFeedbackState
    knowledgeSourceArticleEditor: KnowledgeSourceArticleEditorState
}
