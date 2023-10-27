import {TicketMessageSourceType, TicketVia} from 'business/types/ticket'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {TicketEvent, TicketMessage} from 'models/ticket/types'
import {DEFAULT_SOURCE_TYPE} from 'tickets/common/config'
import {getLastEvent, isLastItemInTicketAnEvent} from 'utils'

import isAnswerableType from './isAnswerableType'
import lastNonSystemTypeMessage from './lastNonSystemTypeMessage'

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export default function responseSourceType(
    messages: Array<TicketMessage>,
    via: TicketVia,
    events: Array<TicketEvent>
): TicketMessageSourceType {
    const lastMessage = lastNonSystemTypeMessage(messages)
    const lastEvent = getLastEvent(events)

    if (lastEvent && isLastItemInTicketAnEvent(lastMessage, lastEvent)) {
        if (
            lastEvent.type === PhoneIntegrationEvent.MissedPhoneCall ||
            lastEvent.type === PhoneIntegrationEvent.VoicemailRecording
        ) {
            return TicketMessageSourceType.Phone
        }
    }

    // some messages don't have sources - failed imports, api, etc..
    if (!lastMessage || !lastMessage.get('source')) {
        if (via === TicketVia.Twilio) {
            return TicketMessageSourceType.InternalNote
        }

        return DEFAULT_SOURCE_TYPE
    }

    const lastSourceType = lastMessage.getIn([
        'source',
        'type',
    ]) as TicketMessageSourceType

    if (lastMessage.getIn(['source', 'extra', 'unfetchable']) as boolean) {
        return TicketMessageSourceType.InternalNote
    }

    if (lastSourceType === TicketMessageSourceType.FacebookPost) {
        return TicketMessageSourceType.FacebookComment
    }

    if (lastSourceType === TicketMessageSourceType.FacebookMentionPost) {
        return TicketMessageSourceType.FacebookMentionComment
    }

    if (lastSourceType === TicketMessageSourceType.FacebookReview) {
        return TicketMessageSourceType.FacebookReviewComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramMedia) {
        return TicketMessageSourceType.InstagramComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramAdMedia) {
        return TicketMessageSourceType.InstagramAdComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramMentionMedia) {
        return TicketMessageSourceType.InstagramMentionComment
    }

    if (lastSourceType === TicketMessageSourceType.TwitterQuotedTweet) {
        return TicketMessageSourceType.TwitterTweet
    }

    if (lastSourceType === TicketMessageSourceType.TwitterMentionTweet) {
        return TicketMessageSourceType.TwitterTweet
    }

    if (lastSourceType === TicketMessageSourceType.YotpoReview) {
        return TicketMessageSourceType.YotpoReviewPublicComment
    }

    if (lastSourceType === TicketMessageSourceType.Sms) {
        return TicketMessageSourceType.Sms
    }

    if (lastSourceType === TicketMessageSourceType.WhatsAppMessage) {
        return TicketMessageSourceType.WhatsAppMessage
    }

    if (lastSourceType === TicketMessageSourceType.Twilio) {
        return TicketMessageSourceType.InternalNote
    }

    if (!isAnswerableType(lastSourceType)) {
        return DEFAULT_SOURCE_TYPE
    }

    return lastSourceType
}
