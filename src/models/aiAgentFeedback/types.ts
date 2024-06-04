import {ReportIssueOption} from './constants'

export type Feedback = 'thumbs_up' | 'thumbs_down' | null

export type Guidance = {
    id: number
    name: string
}

export type Knowledge = {
    type: 'article' | 'external_snippet' | 'macro'
    id: number
    name: string
    url?: string
}

export type Action = {
    id: number
    name: string
}

export type FeedbackOnResource = {
    resourceId: number
    resourceType:
        | 'action'
        | 'guidance'
        | 'article'
        | 'macro'
        | 'external_snippet'
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
    resourceType: 'article' | 'macro' | 'external_snippet'
    resourceId: number
}

export type FeedbackOnMessage =
    | BinaryFeedbackOnMessage
    | IssueFeedbackOnMessage
    | ResourceFeedbackOnMessage

export const isIssueFeedbackOnMessage = (
    feedback: FeedbackOnMessage
): feedback is IssueFeedbackOnMessage => feedback.type === 'issue'

export type MessageFeedback = {
    messageId: number
    summary: string
    orders: {
        id: number
        url: string
    }[]
    guidance: Guidance[]
    knowledge: Knowledge[]
    actions: Action[]
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
    feedbackOnResource?: FeedbackOnResource[]
    feedbackOnMessage?: FeedbackOnMessage[]
}

export type DeleteMessageFeedback = {
    feedbackOnMessage: (IssueFeedbackOnMessage | ResourceFeedbackOnMessage)[]
}
