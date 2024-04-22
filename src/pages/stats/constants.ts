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
export const DOWNLOAD_DATA_BUTTON_LABEL = 'Download data'

export const TODAY = 'Today'
export const LAST_7_DAYS = 'Last 7 days'
export const LAST_30_DAYS = 'Last 30 days'
export const LAST_60_DAYS = 'Last 60 days'
export const LAST_90_DAYS = 'Last 90 days'
