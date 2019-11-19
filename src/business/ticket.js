// @flow
import { humanize } from './format'
import { type Notification } from './notification'

// Public functions
export function canAddAttachments(
    messageType: TicketMessageSourceType,
    newMessage: string,
    attachmentCount: number
): ?Notification {
    let isInvalid = messageType === TicketMessageSourceTypes.FACEBOOK_MESSENGER
        && !!newMessage
        && attachmentCount > 0

    if (isInvalid) {
        return {
            message: `When using ${humanize(messageType)}, you can either send a text message, or an attachment, ` +
                'but not both at the same time.',
            status: 'warning',
        }
    }

    isInvalid = [
        TicketMessageSourceTypes.CHAT,
        TicketMessageSourceTypes.FACEBOOK_COMMENT,
        TicketMessageSourceTypes.FACEBOOK_MESSENGER,
    ].includes(messageType)
        && attachmentCount > 1

    if (isInvalid) {
        return {
            message: `When using ${humanize(messageType)}, you can only send attachments one by one.`,
            status: 'warning',
        }
    }

    return null
}

export function canReply(
    messageType: TicketMessageSourceType,
    attachmentCount: number,
    explicitReason: ?string,
): ?Notification {
    if (!!explicitReason) {
        return {
            message: explicitReason,
            status: 'warning',
        }
    }

    let isInvalid = messageType === TicketMessageSourceTypes.FACEBOOK_MESSENGER
        && attachmentCount > 0

    if (isInvalid) {
        return {
            message: `When using ${humanize(messageType)}, you can either send a text message, or an attachment, ` +
                'but not both at the same time. If you want to write a message, remove the attachment first.',
            status: 'warning',
        }
    }

    return null
}

// Types
export const TicketMessageSourceTypes = Object.freeze({
    AIRCALL: 'aircall',
    API: 'api',
    CHAT: 'chat',
    EMAIL: 'email',
    EMAIL_FORWARD: 'email-forward',
    FACEBOOK_COMMENT: 'facebook-comment',
    FACEBOOK_MESSAGE: 'facebook-message',
    FACEBOOK_MESSENGER: 'facebook-messenger',
    FACEBOOK_POST: 'facebook-post',
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
export type TicketMessageSourceType = $Values<typeof TicketMessageSourceTypes>

export const TicketStatuses = Object.freeze({
    OPEN: 'open',
    CLOSED: 'closed'
})
export type TicketStatus = $Values<typeof TicketStatuses>

export const TicketChannels = Object.freeze({
    AIRCALL: 'aircall',
    API: 'api',
    CHAT: 'chat',
    EMAIL: 'email',
    FACEBOOK: 'facebook',
    FACEBOOK_MESSENGER: 'facebook-messenger',
    INSTAGRAM_AD_COMMENT: 'instagram-ad-comment',
    INSTAGRAM_COMMENT: 'instagram-comment',
    PHONE: 'phone',
    SMS: 'sms',
    TWITTER: 'twitter'
})
export type TicketChannel = $Values<typeof TicketChannels>
