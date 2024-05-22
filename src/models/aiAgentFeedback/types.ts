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

export enum OtherIssueEnum {
    IncorrectLanguageUsed = 'incorrect-language-used',
    SignOffSignature = 'sign-off-signature',
    ToneOfVoice = 'tone-of-voice',
    TooVerbose = 'too-verbose',
    LackOfEmpathy = 'lack-of-empathy',
    OverPromising = 'over-promising',
    MentionsAnActionItDidntPerform = 'mentions-an-action-it-didnt-perform',
    AsksCustomerToContactSupport = 'asks-customer-to-contact-support',
    RespondedToHandoverTopic = 'responded-to-handover-topic',
}

export type OtherIssue = {
    id: OtherIssueEnum
    label: string
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
    reportedIssues: OtherIssue[]
}

export type TicketFeedback = {
    shopName: string
    shopType: string
    messages: MessageFeedback[]
}
