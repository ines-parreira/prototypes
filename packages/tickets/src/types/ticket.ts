export enum TicketStatus {
    Open = 'open',
    Closed = 'closed',
}

export enum TicketChannel {
    Aircall = 'aircall',
    Api = 'api',
    Chat = 'chat',
    ContactForm = 'contact_form',
    Email = 'email',
    Facebook = 'facebook',
    FacebookMention = 'facebook-mention',
    FacebookMessenger = 'facebook-messenger',
    FacebookRecommendations = 'facebook-recommendations',
    HelpCenter = 'help-center',
    InstagramAdComment = 'instagram-ad-comment',
    InstagramComment = 'instagram-comment',
    InstagramDirectMessage = 'instagram-direct-message',
    InstagramMention = 'instagram-mention',
    InternalNote = 'internal-note',
    Phone = 'phone',
    Sms = 'sms',
    Twitter = 'twitter',
    TwitterDirectMessage = 'twitter-direct-message',
    WhatsApp = 'whatsapp',
    YotpoReview = 'yotpo-review',
}

export enum TicketVia {
    GorgiasChat = 'gorgias_chat',
    ContactForm = 'contact_form',
    Email = 'email',
    Helpdesk = 'helpdesk',
    Facebook = 'facebook',
    Twilio = 'twilio',
    Yotpo = 'yotpo',
    Twitter = 'twitter',
    SelfService = 'self_service',
    WhatsApp = 'whatsapp',
    Rule = 'rule',
    Api = 'api',
}

export enum TicketSearchSortableProperties {
    UpdatedDatetime = 'updated_datetime',
    CreatedDatetime = 'created_datetime',
    LastMessageDatetime = 'last_message_datetime',
    LastReceivedMessageDatetime = 'last_received_message_datetime',
    ClosedDatetime = 'closed_datetime',
    SnoozeDatetime = 'snooze_datetime',
    Priority = 'priority',
}
