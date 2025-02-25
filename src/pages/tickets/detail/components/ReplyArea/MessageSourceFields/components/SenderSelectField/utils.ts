import { TicketMessageSourceType } from 'business/types/ticket'
import { ChannelIdentifier } from 'services/channels'

export const getReconnectUrl = (channel: Maybe<ChannelIdentifier>): string => {
    switch (channel) {
        case TicketMessageSourceType.EmailForward:
        case TicketMessageSourceType.Email: {
            return `/app/settings/channels/email`
        }
        case TicketMessageSourceType.Phone: {
            return '/app/settings/channels/phone'
        }
        case TicketMessageSourceType.Sms: {
            return '/app/settings/channels/sms'
        }
        case TicketMessageSourceType.WhatsAppMessage: {
            return '/app/settings/integrations/whatsapp/integrations'
        }
        default: {
            return '/app/settings/integrations/mine'
        }
    }
}
