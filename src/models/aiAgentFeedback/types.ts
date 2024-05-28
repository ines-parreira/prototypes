import {ReportIssueOption} from './constants'

export type Feedback = 'thumbs_up' | 'thumbs_down' | null

export type GuidanceFeedback = {
    id: number
    name: string
    feedback: Feedback
}

export type KnowledgeFeedback = {
    type: 'helpCenter' | 'externalURL' | 'macro'
    id: number
    name: string
    url?: string
    feedback: Feedback
}

export type ActionFeedback = {
    id: number
    name: string
    feedback: Feedback
}

export type FeedbackOnResource = {
    resourceId: number
    feedback: Feedback
}

export type BinaryFeedbackOnMessage = {
    type: 'binary'
    feedback: Feedback
}

export type IssueFeedbackOnMessage = {
    type: 'issue'
    feedback: Feedback
}

export type ResourceFeedbackOnMessage = {
    type: 'resource'
    resourceType: 'article' | 'macro' | 'externalURL'
    resourceId: number
}

export type FeedbackOnMessage =
    | BinaryFeedbackOnMessage
    | IssueFeedbackOnMessage
    | ResourceFeedbackOnMessage

export type MessageFeedback = {
    messageId: number
    summary: string
    orders: {
        id: number
        url: string
    }[]
    guidance: GuidanceFeedback[]
    knowledge: KnowledgeFeedback[]
    actions: ActionFeedback[]
    reportedIssues: ReportIssueOption[]
    allowsFeedback: boolean
    feedbackOnResource: FeedbackOnResource[]
    feedbackOnMessage: FeedbackOnMessage[]
}

export type TicketFeedback = {
    shopName: string
    shopType: string
    messages: MessageFeedback[]
}

export type SubmitMessageFeedback = {
    feedbackOnResource: FeedbackOnResource[]
    feedbackOnMessage: FeedbackOnMessage[]
}
