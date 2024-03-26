import {TicketChannel} from 'business/types/ticket'

export const DEFAULT_TIMEZONE = 'UTC'

export const AUTOMATION_INTENTS_CHANNELS = [
    TicketChannel.Api,
    TicketChannel.Chat,
    TicketChannel.Email,
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.Phone,
    TicketChannel.Sms,
]
