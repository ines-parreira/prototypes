export enum TicketMessageSourceType {
    Aircall = 'aircall',
    Api = 'api',
    Chat = 'chat',
    Email = 'email',
    EmailForward = 'email-forward',
    Facebook = 'facebook',
    FacebookRecommendations = 'facebook-recommendations',
    FacebookComment = 'facebook-comment',
    FacebookReviewComment = 'facebook-review-comment',
    FacebookMessage = 'facebook-message',
    FacebookMessenger = 'facebook-messenger',
    FacebookPost = 'facebook-post',
    FacebookReview = 'facebook-review',
    Instagram = 'instagram',
    InstagramAdComment = 'instagram-ad-comment',
    InstagramAdMedia = 'instagram-ad-media',
    InstagramComment = 'instagram-comment',
    InstagramMedia = 'instagram-media',
    InstagramMentionMedia = 'instagram-mention-media',
    InstagramMentionComment = 'instagram-mention-comment',
    InstagramDirectMessage = 'instagram-direct-message',
    InternalNote = 'internal-note',
    OttspottCall = 'ottspott-call',
    Phone = 'phone',
    SystemMessage = 'system-message',
    Twitter = 'twitter',
}

export enum TicketStatus {
    Open = 'open',
    Closed = 'closed',
}

export enum TicketChannel {
    Aircall = 'aircall',
    Api = 'api',
    Chat = 'chat',
    Email = 'email',
    Facebook = 'facebook',
    FacebookMessenger = 'facebook-messenger',
    FacebookRecommendations = 'facebook-recommendations',
    InstagramAdComment = 'instagram-ad-comment',
    InstagramComment = 'instagram-comment',
    InstagramMention = 'instagram-mention',
    InstagramDirectMessage = 'instagram-direct-message',
    Phone = 'phone',
    Sms = 'sms',
    Twitter = 'twitter',
}

export enum TicketVia {
    GorgiasChat = 'gorgias_chat',
    Email = 'email',
    Helpdesk = 'helpdesk',
    Facebook = 'facebook',
    Twilio = 'twilio',
}
