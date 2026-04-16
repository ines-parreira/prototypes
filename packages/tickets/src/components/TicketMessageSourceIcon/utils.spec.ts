import { IconName } from '@gorgias/axiom'
import {
    LegacyChannelSlug,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

import {
    ticketMessageSourceToIconName,
    ticketMessageSourceToLabel,
} from './utils'

describe('ticketMessageSourceToIconName', () => {
    it.each([
        [TicketMessageSourceType.InternalNote, IconName.Note],
        [TicketMessageSourceType.Email, IconName.CommMail],
        [TicketMessageSourceType.HelpCenterContactForm, IconName.CommMail],
        [TicketMessageSourceType.ContactForm, IconName.CommMail],
        [LegacyChannelSlug.ContactForm, IconName.CommMail],
        [TicketMessageSourceType.Chat, IconName.CommChatCircleDots],
        [TicketMessageSourceType.ChatContactForm, IconName.CommChatCircleDots],
        [
            TicketMessageSourceType.ChatOfflineCapture,
            IconName.CommChatCircleDots,
        ],
        [TicketMessageSourceType.Api, IconName.SystemCode],
        [TicketMessageSourceType.Aircall, IconName.CommPhone],
        [TicketMessageSourceType.OttspottCall, IconName.CommPhone],
        [TicketMessageSourceType.Phone, IconName.CommPhone],
        [TicketMessageSourceType.Twilio, IconName.CommPhone],
        [TicketMessageSourceType.Sms, IconName.CommChatDots],
        [LegacyChannelSlug.HelpCenter, IconName.FileDocument],
        [TicketMessageSourceType.SystemMessage, IconName.Settings],
        [LegacyChannelSlug.FacebookMention, IconName.ChannelFacebook],
        [LegacyChannelSlug.FacebookRecommendations, IconName.ChannelFacebook],
        [TicketMessageSourceType.FacebookComment, IconName.ChannelFacebook],
        [
            TicketMessageSourceType.FacebookReviewComment,
            IconName.ChannelFacebook,
        ],
        [TicketMessageSourceType.Facebook, IconName.ChannelFacebook],
        [TicketMessageSourceType.FacebookReview, IconName.ChannelFacebook],
        [TicketMessageSourceType.FacebookPost, IconName.ChannelFacebook],
        [TicketMessageSourceType.FacebookMentionPost, IconName.ChannelFacebook],
        [
            TicketMessageSourceType.FacebookMentionComment,
            IconName.ChannelFacebook,
        ],
        [TicketMessageSourceType.FacebookMessage, IconName.ChannelFbMessenger],
        [
            TicketMessageSourceType.FacebookMessenger,
            IconName.ChannelFbMessenger,
        ],
        [LegacyChannelSlug.Twitter, IconName.ChannelX],
        [TicketMessageSourceType.TwitterTweet, IconName.ChannelX],
        [TicketMessageSourceType.TwitterQuotedTweet, IconName.ChannelX],
        [TicketMessageSourceType.TwitterMentionTweet, IconName.ChannelX],
        [TicketMessageSourceType.TwitterDirectMessage, IconName.ChannelX],
        [TicketMessageSourceType.Instagram, IconName.ChannelInstagram],
        [TicketMessageSourceType.InstagramAdComment, IconName.ChannelInstagram],
        [TicketMessageSourceType.InstagramAdMedia, IconName.ChannelInstagram],
        [TicketMessageSourceType.InstagramComment, IconName.ChannelInstagram],
        [TicketMessageSourceType.InstagramMedia, IconName.ChannelInstagram],
        [LegacyChannelSlug.InstagramMention, IconName.ChannelInstagram],
        [
            TicketMessageSourceType.InstagramMentionMedia,
            IconName.ChannelInstagram,
        ],
        [
            TicketMessageSourceType.InstagramMentionComment,
            IconName.ChannelInstagram,
        ],
        [
            TicketMessageSourceType.InstagramDirectMessage,
            IconName.ChannelInstagramDm,
        ],
        [TicketMessageSourceType.YotpoReview, IconName.ChannelYotpo],
        [
            TicketMessageSourceType.YotpoReviewPublicComment,
            IconName.ChannelYotpo,
        ],
        [
            TicketMessageSourceType.YotpoReviewPrivateComment,
            IconName.ChannelYotpo,
        ],
        [LegacyChannelSlug.Whatsapp, IconName.ChannelWhatsapp],
        [TicketMessageSourceType.WhatsappMessage, IconName.ChannelWhatsapp],
        [TicketMessageSourceType.TiktokShop, IconName.ChannelTiktok],
        [
            TicketMessageSourceType.GoogleBusinessMessages,
            IconName.ChannelGoogleBusiness,
        ],
        ['unknown-channel' as any, IconName.CircleHelp],
    ])('maps %s to %s', (source, expectedIconName) => {
        expect(ticketMessageSourceToIconName(source)).toBe(expectedIconName)
    })
})

describe('ticketMessageSourceToLabel', () => {
    it.each([
        [TicketMessageSourceType.InternalNote, 'Internal note'],
        [TicketMessageSourceType.Email, 'Email'],
        [TicketMessageSourceType.HelpCenterContactForm, 'Email'],
        [TicketMessageSourceType.ContactForm, 'Email'],
        [LegacyChannelSlug.ContactForm, 'Email'],
        [TicketMessageSourceType.Chat, 'Chat'],
        [TicketMessageSourceType.ChatContactForm, 'Chat'],
        [TicketMessageSourceType.ChatOfflineCapture, 'Chat'],
        [TicketMessageSourceType.Api, 'API'],
        [TicketMessageSourceType.Aircall, 'Phone'],
        [TicketMessageSourceType.OttspottCall, 'Phone'],
        [TicketMessageSourceType.Phone, 'Phone'],
        [TicketMessageSourceType.Twilio, 'Phone'],
        [TicketMessageSourceType.Sms, 'SMS'],
        [LegacyChannelSlug.HelpCenter, 'Help Center'],
        [TicketMessageSourceType.SystemMessage, 'System message'],
        [LegacyChannelSlug.FacebookMention, 'Facebook'],
        [LegacyChannelSlug.FacebookRecommendations, 'Facebook'],
        [TicketMessageSourceType.FacebookComment, 'Facebook'],
        [TicketMessageSourceType.FacebookReviewComment, 'Facebook'],
        [TicketMessageSourceType.Facebook, 'Facebook'],
        [TicketMessageSourceType.FacebookReview, 'Facebook'],
        [TicketMessageSourceType.FacebookPost, 'Facebook'],
        [TicketMessageSourceType.FacebookMentionPost, 'Facebook'],
        [TicketMessageSourceType.FacebookMentionComment, 'Facebook'],
        [TicketMessageSourceType.FacebookMessage, 'Messenger'],
        [TicketMessageSourceType.FacebookMessenger, 'Messenger'],
        [LegacyChannelSlug.Twitter, 'X'],
        [TicketMessageSourceType.TwitterTweet, 'X'],
        [TicketMessageSourceType.TwitterQuotedTweet, 'X'],
        [TicketMessageSourceType.TwitterMentionTweet, 'X'],
        [TicketMessageSourceType.TwitterDirectMessage, 'X'],
        [TicketMessageSourceType.Instagram, 'Instagram'],
        [TicketMessageSourceType.InstagramAdComment, 'Instagram'],
        [TicketMessageSourceType.InstagramAdMedia, 'Instagram'],
        [TicketMessageSourceType.InstagramComment, 'Instagram'],
        [TicketMessageSourceType.InstagramMedia, 'Instagram'],
        [LegacyChannelSlug.InstagramMention, 'Instagram'],
        [TicketMessageSourceType.InstagramMentionMedia, 'Instagram'],
        [TicketMessageSourceType.InstagramMentionComment, 'Instagram'],
        [TicketMessageSourceType.InstagramDirectMessage, 'Instagram DM'],
        [TicketMessageSourceType.YotpoReview, 'Yotpo'],
        [TicketMessageSourceType.YotpoReviewPublicComment, 'Yotpo'],
        [TicketMessageSourceType.YotpoReviewPrivateComment, 'Yotpo'],
        [LegacyChannelSlug.Whatsapp, 'WhatsApp'],
        [TicketMessageSourceType.WhatsappMessage, 'WhatsApp'],
        [TicketMessageSourceType.TiktokShop, 'TikTok Shop'],
        [
            TicketMessageSourceType.GoogleBusinessMessages,
            'Google Business Messages',
        ],
        ['unknown-channel' as any, 'Unknown channel'],
    ])('maps %s to %s', (source, expectedLabel) => {
        expect(ticketMessageSourceToLabel(source)).toBe(expectedLabel)
    })
})
