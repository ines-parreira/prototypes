import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import {TicketMessage} from 'models/ticket/types'
import {DEFAULT_CHANNEL} from 'tickets/common/config'
import {isTicketChannel} from 'models/ticket/predicates'

import isSystemType from './isSystemType'
import lastNonSystemTypeMessage from './lastNonSystemTypeMessage'

/**
 * Return channel of passed source type
 */
export default function sourceTypeToChannel(
    sourceType: TicketMessageSourceType,
    messages: Array<TicketMessage> = []
): TicketChannel | TicketMessageSourceType {
    if (!sourceType) {
        return DEFAULT_CHANNEL
    }

    if (isSystemType(sourceType)) {
        const lastMessage = lastNonSystemTypeMessage(messages)
        if (!lastMessage) {
            return DEFAULT_CHANNEL
        }

        if (lastMessage.get('via') === TicketVia.Twilio) {
            return TicketChannel.Phone
        }

        if (!isTicketChannel(lastMessage.get('channel'))) {
            return sourceType
        }

        const lastSourceType = lastMessage.getIn(['source', 'type'])
        return sourceTypeToChannel(lastSourceType, messages)
    }

    if (sourceType.startsWith('facebook-mention')) {
        return TicketChannel.FacebookMention
    }

    if (
        sourceType.startsWith('facebook') &&
        sourceType !== TicketMessageSourceType.FacebookMessenger
    ) {
        if (
            sourceType === TicketMessageSourceType.FacebookReview ||
            sourceType === TicketMessageSourceType.FacebookReviewComment
        ) {
            return TicketChannel.FacebookRecommendations
        }

        return TicketChannel.Facebook
    }

    if (sourceType.startsWith('instagram-ad')) {
        return TicketChannel.InstagramAdComment
    }

    if (sourceType.startsWith('instagram-mention')) {
        return TicketChannel.InstagramMention
    }

    if (sourceType.startsWith('instagram-direct')) {
        return TicketChannel.InstagramDirectMessage
    }

    if (sourceType.startsWith('instagram')) {
        return TicketChannel.InstagramComment
    }

    if (sourceType.startsWith('yotpo-review')) {
        return TicketChannel.YotpoReview
    }

    if (sourceType === 'ottspott-call') {
        return TicketChannel.Phone
    }

    if (sourceType === TicketMessageSourceType.WhatsAppMessage) {
        return TicketChannel.WhatsApp
    }

    if (
        sourceType === TicketMessageSourceType.TwitterTweet ||
        sourceType === TicketMessageSourceType.TwitterQuotedTweet ||
        sourceType === TicketMessageSourceType.TwitterMentionTweet
    ) {
        return TicketChannel.Twitter
    }

    if (
        [
            TicketMessageSourceType.HelpCenterContactForm,
            TicketMessageSourceType.ChatContactForm,
            TicketMessageSourceType.ContactForm,
            TicketMessageSourceType.ChatOfflineCapture,
        ].includes(sourceType)
    ) {
        return TicketChannel.Email
    }

    return sourceType
}
