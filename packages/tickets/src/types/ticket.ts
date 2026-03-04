export enum TicketStatus {
    Open = 'open',
    Closed = 'closed',
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
