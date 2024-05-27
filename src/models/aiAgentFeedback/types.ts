import {ReportIssueOption} from './constants'

export type GuidanceFeedback = {
    id: number
    name: string
    feedback: -1 | 0 | 1
}

export type KnowledgeFeedback = {
    type: 'helpCenter' | 'externalURL' | 'macro'
    id: number
    name: string
    url?: string
    feedback: -1 | 0 | 1
}

export type ActionFeedback = {
    id: number
    name: string
    feedback: -1 | 0 | 1
}

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
}

export type TicketFeedback = {
    shopName: string
    shopType: string
    messages: MessageFeedback[]
}
