import type { IconName } from '@gorgias/axiom'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { IntegrationType } from 'models/integration/types'
import type { ChannelLike } from 'services/channels'

export const channelToCommunicationIcon = (
    channel?: ChannelLike,
): Extract<
    IconName,
    | 'app-shopify'
    | 'app-magento'
    | 'app-woo'
    | 'app-bicommerce'
    | 'channel-facebook'
    | 'channel-fb-messenger'
    | 'channel-instagram'
    | 'channel-instagram-dm'
    | 'phone'
    | 'chat-dots'
    | 'channel-whatsapp'
    | 'chat-dots-circle'
    | 'mail'
> => {
    switch (channel) {
        case IntegrationType.Shopify:
        case 'shopify':
            return 'app-shopify'
        case IntegrationType.Magento2:
        case 'magento2':
            return 'app-magento'
        case 'woocommerce':
            return 'app-woo'
        case IntegrationType.BigCommerce:
        case 'bigcommerce':
            return 'app-bicommerce'
        case TicketChannel.Facebook:
        case TicketChannel.FacebookMention:
        case TicketMessageSourceType.Facebook:
        case TicketMessageSourceType.FacebookComment:
        case TicketMessageSourceType.FacebookReviewComment:
        case TicketMessageSourceType.FacebookReview:
        case TicketMessageSourceType.FacebookPost:
        case TicketMessageSourceType.FacebookRecommendations:
        case TicketMessageSourceType.FacebookMentionPost:
        case TicketMessageSourceType.FacebookMentionComment:
            return 'channel-facebook'
        case TicketChannel.FacebookMessenger:
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            return 'channel-fb-messenger'
        case TicketChannel.InstagramMention:
        case TicketChannel.InstagramComment:
        case TicketChannel.InstagramAdComment:
        case TicketMessageSourceType.Instagram:
        case TicketMessageSourceType.InstagramAdComment:
        case TicketMessageSourceType.InstagramAdMedia:
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramMedia:
        case TicketMessageSourceType.InstagramMentionMedia:
        case TicketMessageSourceType.InstagramMentionComment:
            return 'channel-instagram'
        case TicketChannel.InstagramDirectMessage:
        case TicketMessageSourceType.InstagramDirectMessage:
            return 'channel-instagram-dm'
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
        case TicketMessageSourceType.Twilio:
        case TicketChannel.Phone:
        case TicketChannel.Aircall:
            return 'phone'
        case TicketMessageSourceType.Sms:
        case TicketChannel.Sms:
            return 'chat-dots'
        case TicketChannel.WhatsApp:
        case TicketMessageSourceType.WhatsAppMessage:
        case IntegrationType.WhatsApp:
            return 'channel-whatsapp'
        case TicketMessageSourceType.Chat:
        case IntegrationType.GorgiasChat:
        case TicketMessageSourceType.ChatContactForm:
        case TicketMessageSourceType.ChatOfflineCapture:
        case TicketChannel.Chat:
            return 'chat-dots-circle'
        case TicketMessageSourceType.Email:
        case IntegrationType.Gmail:
        case IntegrationType.Outlook:
        case IntegrationType.Email:
        case TicketMessageSourceType.HelpCenterContactForm:
        case TicketMessageSourceType.ContactForm:
        case TicketChannel.Email:
        case TicketChannel.ContactForm:
        case TicketMessageSourceType.EmailForward:
            return 'mail'
        default:
            return 'mail'
    }
}
