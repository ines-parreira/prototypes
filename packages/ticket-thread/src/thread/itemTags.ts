export const TicketThreadItemTag = {
    Messages: {
        Message: 'message',
        InternalNote: 'internal-note',
        AiAgentMessage: 'ai-agent-message',
        AiAgentInternalNote: 'ai-agent-internal-note',
        AiAgentDraftMessage: 'ai-agent-draft-message',
        AiAgentTrialMessage: 'ai-agent-trial-message',
        AiAgentHandoverMessage: 'ai-agent-handover-message',
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
        GroupedMessages: 'grouped-messages',
    },
    Events: {
        TicketEvent: 'ticket-event',
        PhoneEvent: 'phone-event',
        AuditLogEvent: 'audit-log-event',
        ActionExecutedEvent: 'action-executed-event',
        SatisfactionSurveyRespondedEvent: 'satisfaction-survey-responded-event',
        PrivateReplyEvent: 'private-reply-event',
        GroupedEvents: 'grouped-events',
    },
    VoiceCalls: {
        VoiceCall: 'voice-call',
        OutboundVoiceCall: 'outbound-voice-call',
    },
    ShoppingAssistant: {
        InfluencedOrder: 'shopping-assistant-influenced-order',
    },
    SatisfactionSurvey: 'satisfaction-survey',
    RuleSuggestion: 'rule-suggestion',
    ContactReasonSuggestion: 'contact-reason-suggestion',
} as const
