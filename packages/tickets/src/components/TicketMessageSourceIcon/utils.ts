import type { IconName } from '@gorgias/axiom'
import {
    LegacyChannelSlug,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

export type TicketMessageSource = TicketMessageSourceType | LegacyChannelSlug

export const ticketMessageSourceToIconName = (
    // Accept any string (e.g. a raw channel slug) in addition to the known
    // sources; unmatched values fall through to the `default` icon. `string & {}`
    // keeps autocomplete for the enum members.
    ticketMessageSource: TicketMessageSource | (string & {}),
): IconName => {
    switch (ticketMessageSource) {
        case TicketMessageSourceType.InternalNote:
            return 'note'
        case TicketMessageSourceType.Email:
        case TicketMessageSourceType.HelpCenterContactForm:
        case TicketMessageSourceType.ContactForm:
        case LegacyChannelSlug.ContactForm:
            return 'mail'
        // case TicketMessageSourceType.EmailForward:
        //     return 'forward'
        case TicketMessageSourceType.Chat:
        case TicketMessageSourceType.ChatContactForm:
        case TicketMessageSourceType.ChatOfflineCapture:
            return 'chat-dots-circle'
        case TicketMessageSourceType.Api:
            return 'system-code'
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
        case TicketMessageSourceType.Twilio:
            return 'phone'
        case TicketMessageSourceType.Sms:
            return 'chat-dots'
        case LegacyChannelSlug.HelpCenter:
            return 'file-document'
        case TicketMessageSourceType.SystemMessage:
            return 'settings'
        case LegacyChannelSlug.FacebookMention:
        case LegacyChannelSlug.FacebookRecommendations:
        case TicketMessageSourceType.FacebookComment:
        case TicketMessageSourceType.FacebookReviewComment:
        case TicketMessageSourceType.Facebook:
        case TicketMessageSourceType.FacebookReview:
        case TicketMessageSourceType.FacebookPost:
        case TicketMessageSourceType.FacebookMentionPost:
        case TicketMessageSourceType.FacebookMentionComment:
            /**
             * TODO: Add Facebook Feed icon
             */
            // icon.name = 'facebook-feed'
            return 'channel-facebook'
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            return 'channel-fb-messenger'

        case LegacyChannelSlug.Twitter:
        case TicketMessageSourceType.TwitterTweet:
        case TicketMessageSourceType.TwitterQuotedTweet:
        case TicketMessageSourceType.TwitterMentionTweet:
            return 'channel-x'
        case TicketMessageSourceType.TwitterDirectMessage:
            /**
             * TODO: Add Twitter Direct Message icon
             */
            // icon.name = 'twitter-dm'
            return 'channel-x'
        case TicketMessageSourceType.Instagram:
        case TicketMessageSourceType.InstagramAdComment:
        case TicketMessageSourceType.InstagramAdMedia:
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramMedia:
        case LegacyChannelSlug.InstagramMention:
        case TicketMessageSourceType.InstagramMentionMedia:
        case TicketMessageSourceType.InstagramMentionComment:
            return 'channel-instagram'
        case TicketMessageSourceType.InstagramDirectMessage:
            return 'channel-instagram-dm'
        case TicketMessageSourceType.YotpoReview:
            /**
             * TODO: Add Yotpo Review icon
             */
            // icon.name = 'yotpo-review'
            return 'channel-yotpo'

        case TicketMessageSourceType.YotpoReviewPublicComment:
            /**
             * TODO: Add Yotpo Review public comment icon
             */
            // icon.name = 'yotpo-review-public-comment'
            return 'channel-yotpo'
        case TicketMessageSourceType.YotpoReviewPrivateComment:
            /**
             * TODO: Add Yotpo Review private comment icon
             */
            // icon.name = 'yotpo-review-private-comment'
            return 'channel-yotpo'
        case LegacyChannelSlug.Whatsapp:
        case TicketMessageSourceType.WhatsappMessage:
            return 'channel-whatsapp'
        case TicketMessageSourceType.TiktokShop:
            return 'channel-tiktok'
        case TicketMessageSourceType.GoogleBusinessMessages:
            return 'channel-google-business'
        default:
            return 'help-circle'
    }
}

export const ticketMessageSourceToLabel = (
    ticketMessageSource: TicketMessageSource,
): string => {
    switch (ticketMessageSource) {
        case TicketMessageSourceType.InternalNote:
            return 'Internal note'
        case TicketMessageSourceType.Email:
        case TicketMessageSourceType.HelpCenterContactForm:
        case TicketMessageSourceType.ContactForm:
        case LegacyChannelSlug.ContactForm:
            return 'Email'
        case TicketMessageSourceType.Chat:
        case TicketMessageSourceType.ChatContactForm:
        case TicketMessageSourceType.ChatOfflineCapture:
            return 'Chat'
        case TicketMessageSourceType.Api:
            return 'API'
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
        case TicketMessageSourceType.Twilio:
            return 'Phone'
        case TicketMessageSourceType.Sms:
            return 'SMS'
        case LegacyChannelSlug.HelpCenter:
            return 'Help Center'
        case TicketMessageSourceType.SystemMessage:
            return 'System message'
        case LegacyChannelSlug.FacebookMention:
        case LegacyChannelSlug.FacebookRecommendations:
        case TicketMessageSourceType.FacebookComment:
        case TicketMessageSourceType.FacebookReviewComment:
        case TicketMessageSourceType.Facebook:
        case TicketMessageSourceType.FacebookReview:
        case TicketMessageSourceType.FacebookPost:
        case TicketMessageSourceType.FacebookMentionPost:
        case TicketMessageSourceType.FacebookMentionComment:
            return 'Facebook'
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            return 'Messenger'
        case LegacyChannelSlug.Twitter:
        case TicketMessageSourceType.TwitterTweet:
        case TicketMessageSourceType.TwitterQuotedTweet:
        case TicketMessageSourceType.TwitterMentionTweet:
        case TicketMessageSourceType.TwitterDirectMessage:
            return 'X'
        case TicketMessageSourceType.Instagram:
        case TicketMessageSourceType.InstagramAdComment:
        case TicketMessageSourceType.InstagramAdMedia:
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramMedia:
        case LegacyChannelSlug.InstagramMention:
        case TicketMessageSourceType.InstagramMentionMedia:
        case TicketMessageSourceType.InstagramMentionComment:
            return 'Instagram'
        case TicketMessageSourceType.InstagramDirectMessage:
            return 'Instagram DM'
        case TicketMessageSourceType.YotpoReview:
        case TicketMessageSourceType.YotpoReviewPublicComment:
        case TicketMessageSourceType.YotpoReviewPrivateComment:
            return 'Yotpo'
        case LegacyChannelSlug.Whatsapp:
        case TicketMessageSourceType.WhatsappMessage:
            return 'WhatsApp'
        case TicketMessageSourceType.TiktokShop:
            return 'TikTok Shop'
        case TicketMessageSourceType.GoogleBusinessMessages:
            return 'Google Business Messages'
        default:
            return 'Unknown channel'
    }
}
