import {TicketChannel} from 'business/types/ticket'

export const DEFAULT_TIMEZONE = 'UTC'

export const AUTOMATION_INTENTS_CHANNELS = [
    TicketChannel.Api,
    TicketChannel.Chat,
    TicketChannel.ContactForm,
    TicketChannel.Email,
    TicketChannel.Facebook,
    TicketChannel.FacebookMention,
    TicketChannel.FacebookMessenger,
    TicketChannel.HelpCenter,
    TicketChannel.InstagramAdComment,
    TicketChannel.InstagramComment,
    TicketChannel.InstagramDirectMessage,
    TicketChannel.InstagramMention,
    TicketChannel.Phone,
    TicketChannel.Sms,
    TicketChannel.Twitter,
    TicketChannel.TwitterDirectMessage,
    TicketChannel.WhatsApp,
    TicketChannel.YotpoReview,
]
