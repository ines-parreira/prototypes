import type { TicketThreadContactReasonSuggestionItem } from './contact-reason-prediction/types'
import type { TicketThreadEventItem } from './events/types'
import type { TicketThreadMessageItem } from './messages/types'
import type { TicketThreadRuleSuggestionItem } from './rules-suggestions/types'
import type { TicketThreadSatisfactionSurveyItem } from './satisfaction-survey/types'
import type {
    TicketThreadOutboundVoiceCallItem,
    TicketThreadVoiceCallItem,
} from './voice-calls/types'

export const TicketThreadItemTag = {
    Messages: {
        Message: 'message',
        InternalNote: 'internal-note',
        AiAgentMessage: 'ai-agent-message',
        AiAgentInternalNote: 'ai-agent-internal-note',
        AiAgentDraftMessage: 'ai-agent-draft-message',
        AiAgentTrialMessage: 'ai-agent-trial-message',
        SocialMediaFacebookComment: 'social-media-facebook-comment',
        SocialMediaFacebookPost: 'social-media-facebook-post',
        SocialMediaFacebookMessage: 'social-media-facebook-message',
        SocialMediaInstagramComment: 'social-media-instagram-comment',
        SocialMediaInstagramDirectMessage:
            'social-media-instagram-direct-message',
        SocialMediaInstagramMedia: 'social-media-instagram-media',
        SocialMediaInstagramStoryMention:
            'social-media-instagram-story-mention',
        SocialMediaInstagramStoryReply: 'social-media-instagram-story-reply',
        SocialMediaTwitterTweet: 'social-media-twitter-tweet',
        SocialMediaTwitterDirectMessage: 'social-media-twitter-direct-message',
        SocialMediaWhatsAppMessage: 'social-media-whatsapp-message',
        MergedMessages: 'merged-messages',
    },
    Events: {
        TicketEvent: 'ticket-event',
        PhoneEvent: 'phone-event',
        AuditLogEvent: 'audit-log-event',
        SatisfactionSurveyRespondedEvent: 'satisfaction-survey-responded-event',
        PrivateReplyEvent: 'private-reply-event',
        ShoppingAssistantEvent: 'shopping-assistant-event',
    },
    VoiceCalls: {
        VoiceCall: 'voice-call',
        OutboundVoiceCall: 'outbound-voice-call',
    },
    SatisfactionSurvey: 'satisfaction-survey',
    RuleSuggestion: 'rule-suggestion',
    ContactReasonSuggestion: 'contact-reason-suggestion',
} as const

export type TicketThreadItem =
    | TicketThreadMessageItem
    | TicketThreadEventItem
    | TicketThreadVoiceCallItem
    | TicketThreadOutboundVoiceCallItem
    | TicketThreadSatisfactionSurveyItem
    | TicketThreadRuleSuggestionItem
    | TicketThreadContactReasonSuggestionItem
