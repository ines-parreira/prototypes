import {NotificationStatus} from '../state/notifications/types'

import {humanize} from './format'
import {Notification} from './types/notification'
import {TicketMessageSourceType} from './types/ticket'

//TODO(@Mehdi) Instagram DM specific, Remove this when we do https://github.com/gorgias/gorgias/issues/7516
export function canReply(
    messageType: TicketMessageSourceType,
    attachmentCount: number,
    explicitReason: Maybe<string>
): Maybe<Notification> {
    if (!!explicitReason) {
        return {
            message: explicitReason,
            status: NotificationStatus.Warning,
        }
    }

    const isInvalid =
        messageType === TicketMessageSourceType.InstagramDirectMessage &&
        attachmentCount > 0

    if (isInvalid) {
        return {
            message:
                `When using ${humanize(
                    messageType
                )}, you can either send a text message, or an image attachment, ` +
                'but not both at the same time. If you want to write a message, remove the attachment first.',
            status: NotificationStatus.Warning,
        }
    }

    return null
}

// Public functions
export function canAddAttachments(
    messageType: TicketMessageSourceType,
    newMessage: string,
    attachmentCount: number
): Maybe<Notification> {
    const messagePlusAttachmentInvalidSources = [
        TicketMessageSourceType.InstagramDirectMessage,
    ]

    let isInvalid =
        messagePlusAttachmentInvalidSources.includes(messageType) &&
        !!newMessage

    if (isInvalid) {
        //TODO(@Mehdi) Instagram DM specific, Remove this when we do https://github.com/gorgias/gorgias/issues/7516
        return {
            message:
                `When using ${humanize(
                    messageType
                )}, you can either send a text message, or an image attachment, ` +
                'but not both at the same time.',
            status: NotificationStatus.Warning,
        }
    }

    let maxAttachmentsCount = new Map([
        [TicketMessageSourceType.FacebookComment, 1],
        [TicketMessageSourceType.FacebookMentionComment, 1],
        [TicketMessageSourceType.FacebookReviewComment, 1],
        [TicketMessageSourceType.InstagramDirectMessage, 1],
        [TicketMessageSourceType.InstagramComment, 0],
        [TicketMessageSourceType.InstagramMentionComment, 0],
        [TicketMessageSourceType.TwitterTweet, 4],
        [TicketMessageSourceType.TwitterDirectMessage, 1],
        [TicketMessageSourceType.YotpoReviewPublicComment, 0],
        [TicketMessageSourceType.YotpoReviewPrivateComment, 0],
        [TicketMessageSourceType.Sms, 1],
    ]).get(messageType)

    isInvalid =
        typeof maxAttachmentsCount !== 'undefined' &&
        attachmentCount > maxAttachmentsCount

    if (isInvalid) {
        if (maxAttachmentsCount === 1) {
            return {
                message: `When using ${humanize(
                    messageType
                )}, you can only send attachments one by one.`,
                status: NotificationStatus.Warning,
            }
        } else if (maxAttachmentsCount === 0) {
            return {
                message: `When using ${humanize(
                    messageType
                )}, you can not send attachments.`,
                status: NotificationStatus.Warning,
            }
        }

        maxAttachmentsCount = maxAttachmentsCount || 0
        return {
            message: `When using ${humanize(
                messageType
            )}, you can add a maximum of ${maxAttachmentsCount} attachments.`,
            status: NotificationStatus.Warning,
        }
    }
    return null
}

//$TsFixMe legacy constant for flow usage, use enum at src/business/types/ticket.ts instead
export const TicketMessageSourceTypes = Object.freeze({
    AIRCALL: 'aircall',
    API: 'api',
    CHAT: 'chat',
    EMAIL: 'email',
    EMAIL_FORWARD: 'email-forward',
    FACEBOOK_COMMENT: 'facebook-comment',
    FACEBOOK_REVIEW_COMMENT: 'facebook-review-comment',
    FACEBOOK_MESSAGE: 'facebook-message',
    FACEBOOK_MESSENGER: 'facebook-messenger',
    FACEBOOK_POST: 'facebook-post',
    FACEBOOK_MENTION_POST: 'facebook-mention-post',
    FACEBOOK_MENTION_COMMENT: 'facebook-mention-comment',
    FACEBOOK_REVIEW: 'facebook-review',
    INSTAGRAM_AD_COMMENT: 'instagram-ad-comment',
    INSTAGRAM_AD_MEDIA: 'instagram-ad-media',
    INSTAGRAM_COMMENT: 'instagram-comment',
    INSTAGRAM_MEDIA: 'instagram-media',
    INSTAGRAM_MENTION_MEDIA: 'instagram-mention-media',
    INSTAGRAM_MENTION_COMMENT: 'instagram-mention-comment',
    INSTAGRAM_DIRECT_MESSAGE: 'instagram-direct-message',
    INTERNAL_NOTE: 'internal-note',
    OTTSPOTT_CALL: 'ottspott-call',
    PHONE: 'phone',
    SYSTEM_MESSAGE: 'system-message',
    TWITTER_TWEET: 'twitter-tweet',
    TWITTER_QUOTED_TWEET: 'twitter-quoted-tweet',
    TWITTER_MENTION_TWEET: 'twitter-mention-tweet',
})

//$TsFixMe legacy constant for flow usage, use enum at src/business/types/ticket.ts instead
export const TicketStatuses = Object.freeze({
    OPEN: 'open',
    CLOSED: 'closed',
})

//$TsFixMe legacy constant for flow usage, use enum at src/business/types/ticket.ts instead
export const TicketChannels = Object.freeze({
    AIRCALL: 'aircall',
    API: 'api',
    CHAT: 'chat',
    EMAIL: 'email',
    FACEBOOK: 'facebook',
    FACEBOOK_MENTION: 'facebook-mention',
    FACEBOOK_RECOMMENDATIONS_CHANNEL: 'facebook-recommendations',
    FACEBOOK_MESSENGER: 'facebook-messenger',
    INSTAGRAM_AD_COMMENT: 'instagram-ad-comment',
    INSTAGRAM_COMMENT: 'instagram-comment',
    INSTAGRAM_MENTION: 'instagram-mention',
    INSTAGRAM_DIRECT_MESSAGE: 'instagram-direct-message',
    PHONE: 'phone',
    SMS: 'sms',
    TWITTER: 'twitter',
})

//$TsFixMe legacy constant for flow usage, use enum at src/business/types/ticket.ts instead
export const TicketVias = Object.freeze({
    GORGIAS_CHAT: 'gorgias_chat',
})
