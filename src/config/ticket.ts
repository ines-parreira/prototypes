import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {isTicketMessageSourceType} from 'models/ticket/predicates'
import {TicketEvent, TicketMessage} from 'models/ticket/types'
import {ChannelLike, toChannel} from 'services/channels'
import {isForwardedMessage} from 'state/ticket/utils'
import {
    compare,
    getLastEvent,
    getLastMessage,
    isLastItemInTicketAnEvent,
    toImmutable,
} from 'utils'

import {
    DEFAULT_CHANNEL,
    DEFAULT_SOURCE_TYPE,
    HIDDEN_VARIABLES,
    PREVIOUS_VARIABLES,
    SYSTEM_SOURCE_TYPES,
    USABLE_SOURCE_TYPES,
    Variable,
    VARIABLES,
} from 'tickets/common/config'

/**
 * Return passed messages ordered by created_datetime
 */
export function orderedMessages(
    messages: Array<TicketMessage> | List<any>
): Map<any, any> {
    return toImmutable<List<any>>(messages).sort(
        (a: Map<any, any>, b: Map<any, any>) =>
            compare(a.get('created_datetime'), b.get('created_datetime'))
    ) as Map<any, any>
}

/**
 * Return true if passed source type can be used to answer (can be used as a source type in a new message)
 */
export function isAnswerableType(channelLike: ChannelLike): boolean {
    if (isTicketMessageSourceType(channelLike)) {
        return USABLE_SOURCE_TYPES.includes(channelLike)
    }

    const channel = toChannel(channelLike)
    if (channel) {
        return true
    }

    return false
}

/**
 * Return true if passed source type is a system source type
 */
export function isSystemType(sourceType: TicketMessageSourceType): boolean {
    return SYSTEM_SOURCE_TYPES.includes(sourceType)
}

/**
 * Get the most recent message that was not a system-type message, if any
 */
export function lastNonSystemTypeMessage(messages: Array<TicketMessage>) {
    const filteredMessages = orderedMessages(messages).filter(
        (message: Map<any, any>) => {
            return (
                !isSystemType(message.getIn(['source', 'type'])) &&
                !isForwardedMessage(message)
            )
        }
    )
    return (!filteredMessages.isEmpty() &&
        fromJS(getLastMessage(filteredMessages.toJS()))) as Maybe<Map<any, any>>
}

/**
 * Return channel of passed source type
 */
export function sourceTypeToChannel(
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

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export function responseSourceType(
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

/**
 * Return true if source type is public type
 */
export function isPublic(sourceType: TicketMessageSourceType): boolean {
    return sourceType !== TicketMessageSourceType.InternalNote
}

/**
 * Return true if type supports HTML content
 */
export function isRichType(sourceType: TicketMessageSourceType): boolean {
    return [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.InternalNote,
        TicketMessageSourceType.Chat,
    ].includes(sourceType)
}

/**
 * Return true if can leave internal note
 */
export function canLeaveInternalNote(
    sourceType: TicketMessageSourceType
): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}

/**
 * Return variables config
 */
export function getVariables(types: Array<string> | null): Array<Variable> {
    if (!types) {
        return VARIABLES.filter((variable) => !variable.explicit)
    }

    return VARIABLES.filter((variables) => types.includes(variables.type))
}

/**
 * Return array of configs of variables
 * Autocomplete fullName and type properties of each config
 */
export function getVariablesList(
    variablesList: Array<Variable> = VARIABLES
): Array<Variable> {
    const variables: Variable[] = []

    variablesList.forEach((category) => {
        if (category.children !== undefined) {
            category.children.forEach((variable) => {
                const object = {
                    ...variable,
                    fullName: variable.fullName || variable.name,
                } as Variable

                if (category.type) {
                    object.type = category.type
                }

                if (category.integration) {
                    object.integration = category.integration
                }

                variables.push(object)
            })
        } else {
            variables.push({
                value: category.value,
                type: category.type,
                fullName: category.fullName || category.name,
            } as Variable)
        }
    })

    return variables
}

/**
 * Return variable config with passed value
 */
export function getVariableWithValue(value: string) {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return (
        _find(variables, {value}) ||
        _find(previousVariables, {value}) ||
        _find(hiddenVariables, {value})
    )
}
