import {humanize} from './format'
import {Notification} from './types/notification'
import {TicketMessageSourceType} from './types/ticket'

// Public functions
export function canAddAttachments(
    messageType: TicketMessageSourceType,
    newMessage: string,
    attachmentCount: number
): Maybe<Notification> {
    let isInvalid =
        messageType === TicketMessageSourceType.FacebookMessenger &&
        !!newMessage &&
        attachmentCount > 0

    if (isInvalid) {
        return {
            message:
                `When using ${humanize(
                    messageType
                )}, you can either send a text message, or an attachment, ` +
                'but not both at the same time.',
            status: 'warning',
        }
    }

    isInvalid =
        [
            TicketMessageSourceType.Chat,
            TicketMessageSourceType.FacebookComment,
            TicketMessageSourceType.FacebookReviewComment,
            TicketMessageSourceType.FacebookMessenger,
        ].includes(messageType) && attachmentCount > 1

    if (isInvalid) {
        return {
            message: `When using ${humanize(
                messageType
            )}, you can only send attachments one by one.`,
            status: 'warning',
        }
    }

    return null
}

//$TsFixMe legacy constant for flow usage, use enum at g/static/private/js/business/types/ticket.ts instead
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
    FACEBOOK_REVIEW: 'facebook-review',
    INSTAGRAM_AD_COMMENT: 'instagram-ad-comment',
    INSTAGRAM_AD_MEDIA: 'instagram-ad-media',
    INSTAGRAM_COMMENT: 'instagram-comment',
    INSTAGRAM_MEDIA: 'instagram-media',
    INTERNAL_NOTE: 'internal-note',
    OTTSPOTT_CALL: 'ottspott-call',
    PHONE: 'phone',
    SYSTEM_MESSAGE: 'system-message',
    TWITTER: 'twitter',
})

//$TsFixMe legacy constant for flow usage, use enum at g/static/private/js/business/types/ticket.ts instead
export const TicketStatuses = Object.freeze({
    OPEN: 'open',
    CLOSED: 'closed',
})

//$TsFixMe legacy constant for flow usage, use enum at g/static/private/js/business/types/ticket.ts instead
export const TicketChannels = Object.freeze({
    AIRCALL: 'aircall',
    API: 'api',
    CHAT: 'chat',
    EMAIL: 'email',
    FACEBOOK: 'facebook',
    FACEBOOK_RECOMMENDATIONS_CHANNEL: 'facebook-recommendations',
    FACEBOOK_MESSENGER: 'facebook-messenger',
    INSTAGRAM_AD_COMMENT: 'instagram-ad-comment',
    INSTAGRAM_COMMENT: 'instagram-comment',
    PHONE: 'phone',
    SMS: 'sms',
    TWITTER: 'twitter',
})

//$TsFixMe legacy constant for flow usage, use enum at g/static/private/js/business/types/ticket.ts instead
export const TicketVias = Object.freeze({
    GORGIAS_CHAT: 'gorgias_chat',
})
