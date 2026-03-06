import { IconName } from '@gorgias/axiom'
import {
    LegacyChannelSlug,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

export type TicketMessageSource = TicketMessageSourceType | LegacyChannelSlug

export const ticketMessageSourceToIconName = (
    ticketMessageSource: TicketMessageSource,
): IconName => {
    switch (ticketMessageSource) {
        case TicketMessageSourceType.InternalNote:
            return IconName.Note
        case TicketMessageSourceType.Email:
        case TicketMessageSourceType.HelpCenterContactForm:
        case TicketMessageSourceType.ContactForm:
        case LegacyChannelSlug.ContactForm:
            return IconName.CommMail
        // case TicketMessageSourceType.EmailForward:
        //     return IconName.Forward
        case TicketMessageSourceType.Chat:
        case TicketMessageSourceType.ChatContactForm:
        case TicketMessageSourceType.ChatOfflineCapture:
            return IconName.CommChatCircleDots
        case TicketMessageSourceType.Api:
            return IconName.SystemCode
        case TicketMessageSourceType.Aircall:
        case TicketMessageSourceType.OttspottCall:
        case TicketMessageSourceType.Phone:
        case TicketMessageSourceType.Twilio:
            return IconName.CommPhone
        case TicketMessageSourceType.Sms:
            return IconName.CommChatDots
        case LegacyChannelSlug.HelpCenter:
            return IconName.CircleHelp
        case TicketMessageSourceType.SystemMessage:
            return IconName.Settings
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
            return IconName.ChannelFacebook
        case TicketMessageSourceType.FacebookMessage:
        case TicketMessageSourceType.FacebookMessenger:
            return IconName.ChannelFbMessenger

        case LegacyChannelSlug.Twitter:
        case TicketMessageSourceType.TwitterTweet:
        case TicketMessageSourceType.TwitterQuotedTweet:
        case TicketMessageSourceType.TwitterMentionTweet:
            return IconName.ChannelX
        case TicketMessageSourceType.TwitterDirectMessage:
            /**
             * TODO: Add Twitter Direct Message icon
             */
            // icon.name = 'twitter-dm'
            return IconName.ChannelX
        case TicketMessageSourceType.Instagram:
        case TicketMessageSourceType.InstagramAdComment:
        case TicketMessageSourceType.InstagramAdMedia:
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramMedia:
        case LegacyChannelSlug.InstagramMention:
        case TicketMessageSourceType.InstagramMentionMedia:
        case TicketMessageSourceType.InstagramMentionComment:
            return IconName.ChannelInstagram
        case TicketMessageSourceType.InstagramDirectMessage:
            return IconName.ChannelInstagramDm
        case TicketMessageSourceType.YotpoReview:
            /**
             * TODO: Add Yotpo Review icon
             */
            // icon.name = 'yotpo-review'
            return IconName.ChannelYotpo

        case TicketMessageSourceType.YotpoReviewPublicComment:
            /**
             * TODO: Add Yotpo Review public comment icon
             */
            // icon.name = 'yotpo-review-public-comment'
            return IconName.ChannelYotpo
        case TicketMessageSourceType.YotpoReviewPrivateComment:
            /**
             * TODO: Add Yotpo Review private comment icon
             */
            // icon.name = 'yotpo-review-private-comment'
            return IconName.ChannelYotpo
        case LegacyChannelSlug.Whatsapp:
        case TicketMessageSourceType.WhatsappMessage:
            return IconName.ChannelWhatsapp
        case TicketMessageSourceType.TiktokShop:
            return IconName.ChannelTiktok
        case TicketMessageSourceType.GoogleBusinessMessages:
            return IconName.ChannelGoogleBusiness
        default:
            return IconName.CircleHelp
    }
}
