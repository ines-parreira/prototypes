import type { MacroAction } from 'models/macroAction/types'
import type {
    ActionStatus,
    AiAgentKnowledgeResourceTypeEnum,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import type { ReportIssueOption } from './constants'

export type Feedback = 'thumbs_up' | 'thumbs_down' | null

export type Guidance = {
    id: number
    name: string
}

export type Knowledge = {
    type: 'article' | 'external_snippet' | 'macro' | 'file_external_snippet'
    id: number | string
    name: string
    url?: string
}

export type Action = {
    type: 'soft_action' | 'hard_action'
    id: number
    name: string
    status?: ActionStatus
}

export type FeedbackOnResource = {
    resourceId: number | string
    resourceType:
        | 'soft_action'
        | 'hard_action'
        | 'guidance'
        | 'article'
        | 'macro'
        | 'external_snippet'
        | 'file_external_snippet'
    type: 'binary'
    feedback: Feedback
}

export type BinaryFeedbackOnMessage = {
    type: 'binary'
    feedback: Feedback
}

export type IssueFeedbackOnMessage = {
    type: 'issue'
    feedback: ReportIssueOption
}

export type ResourceFeedbackOnMessage = {
    type: 'resource'
    resourceType:
        | 'soft_action'
        | 'hard_action'
        | 'guidance'
        | 'article'
        | 'macro'
        | 'external_snippet'
        | 'file_external_snippet'
        | 'other'
    resourceId: number | string
}

export type KnowledgeReasoningResource = {
    resourceId: string
    resourceType: AiAgentKnowledgeResourceTypeEnum
    resourceSetId?: string
    resourceTitle?: string
    resourceIsDraft?: boolean
    resourceVersion?: string | null
    resourceLocale?: string | null
}

export type NoteFeedbackOnMessage = {
    type: 'note'
    feedback: string
}

export type FeedbackOnMessage =
    | BinaryFeedbackOnMessage
    | IssueFeedbackOnMessage
    | ResourceFeedbackOnMessage
    | NoteFeedbackOnMessage

export const isIssueFeedbackOnMessage = (
    feedback: FeedbackOnMessage,
): feedback is IssueFeedbackOnMessage => feedback.type === 'issue'

export type MessageFeedback = {
    accountId: number
    shopName: string
    shopType: string
    helpCenterId: number
    guidanceHelpCenterId: number
    snippetHelpCenterId: number
    executionId: string
    messageId: number
    summary?: string
    orders: {
        id: number
        name: string
        url: string
    }[]
    guidance: Guidance[]
    knowledge: Knowledge[]
    actions: Action[]
    allowsFeedback: boolean
    feedbackOnResource: FeedbackOnResource[]
    feedbackOnMessage: FeedbackOnMessage[]
    draftMessage: {
        content: string | null
        ticketActions: MacroAction[] | null
    }
}

export type TicketFeedback = {
    messages: MessageFeedback[]
}

export type SubmitMessageFeedback = {
    feedbackOnResource: FeedbackOnResource[]
    feedbackOnMessage: FeedbackOnMessage[]
}

export type DeleteMessageFeedback = {
    feedbackOnResource: FeedbackOnResource[]
    feedbackOnMessage: FeedbackOnMessage[]
}
