export const PHONE_EVENTS = [
    'phone-call-conversation-started',
    'phone-call-forwarded-to-external-number',
    'phone-call-forwarded-to-gorgias-number',
    'phone-call-forwarded',
    'message-played',
] as const

export const AUDIT_LOG_EVENT_TYPES = [
    'rule-suggestion-suggested',
    'ticket-assigned',
    'ticket-closed',
    'ticket-created',
    'ticket-split',
    'ticket-customer-updated',
    'ticket-excluded-from-auto-merge',
    'ticket-excluded-from-csat',
    'ticket-marked-spam',
    'ticket-merged',
    'ticket-message-summary-created',
    'ticket-reopened',
    'ticket-satisfaction-survey-skipped',
    'ticket-self-unsnoozed',
    'ticket-snoozed',
    'ticket-subject-updated',
    'ticket-tags-added',
    'ticket-tags-removed',
    'ticket-team-assigned',
    'ticket-team-unassigned',
    'ticket-trashed',
    'ticket-unassigned',
    'ticket-unmarked-spam',
    'ticket-untrashed',
    'rule-executed',
    'satisfaction-survey-sent',
] as const

export const SATISFACTION_SURVEY_RESPONDED_EVENT_TYPE =
    'satisfaction-survey-responded' as const
export const SYSTEM_RULE_TYPE = 'system' as const

export const PRIVATE_REPLY_ACTIONS = [
    'facebookPrivateReply',
    'instagramPrivateReply',
] as const

export const MESSAGING_TICKET_PRIVATE_REPLY_EVENT =
    'MessagingTicketPrivateReplyEvent'
export const COMMENT_TICKET_PRIVATE_REPLY_EVENT =
    'CommentTicketPrivateReplyEvent'

export enum InfluencedOrderSource {
    AI_JOURNEY = 'ai-journey',
    SHOPPING_ASSISTANT = 'shopping-assistant',
    AI_AGENT = 'ai-agent',
}
