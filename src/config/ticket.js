import {fromJS} from 'immutable'
import {getLastMessage, compare} from '../utils'
import {isForwardedMessage} from '../state/ticket/utils'

export const DEFAULT_CHANNEL = 'email'
export const DEFAULT_SOURCE_TYPE = 'email'

export const SYSTEM_SOURCE_TYPES = ['internal-note', 'system-message']

// source types that can not be used to answer
export const UNUSABLE_SOURCE_TYPES = ['phone', 'facebook', 'api', 'facebook-post', 'ottspott-call', 'system-message']

export const orderedMessages = (messages) => {
    return messages.sort((a, b) => compare(a.get('created_datetime'), b.get('created_datetime')))
}

/**
 * Get the most recent message that was not a system-type message
 * @param messages
 * @returns {*}
 */
export function lastNonSystemTypeMessage(messages) {
    messages = orderedMessages(messages)
    const filteredMessages = messages.filter(message => {
        return !SYSTEM_SOURCE_TYPES.includes(message.getIn(['source', 'type'])) && !isForwardedMessage(message)
    })
    return !filteredMessages.isEmpty() && fromJS(getLastMessage(filteredMessages.toJS()))
}

/**
 * Return channel of passed source type
 * @param sourceType
 * @param messages
 * @returns {*}
 */
export const sourceTypeToChannel = (sourceType, messages) => {
    if (!sourceType) {
        return DEFAULT_CHANNEL
    }

    if (SYSTEM_SOURCE_TYPES.includes(sourceType)) {
        const lastMessage = lastNonSystemTypeMessage(messages)

        if (!lastMessage) {
            return DEFAULT_CHANNEL
        }

        const lastSourceType = lastMessage.getIn(['source', 'type'])
        return sourceTypeToChannel(lastSourceType, messages)
    }

    if (sourceType.startsWith('facebook')) {
        return 'facebook'
    }

    if (sourceType === 'ottspott-call') {
        return 'phone'
    }

    return sourceType
}

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export const responseSourceType = (messages) => {
    messages = orderedMessages(messages)

    if (!messages) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastMessage = lastNonSystemTypeMessage(messages)

    // some messages don't have sources - failed imports, api, etc..
    if (!lastMessage || !lastMessage.get('source')) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastSourceType = lastMessage.getIn(['source', 'type'])

    if (lastSourceType === 'facebook-post') {
        return 'facebook-comment'
    }

    if (UNUSABLE_SOURCE_TYPES.includes(lastSourceType)) {
        return DEFAULT_SOURCE_TYPE
    }

    return lastSourceType
}

/**
 * Return true if source type is public type
 * @param sourceType
 * @returns {boolean}
 */
export const isPublic = (sourceType) => {
    return sourceType !== 'internal-note'
}

/**
 * Return true if type supports HTML content
 * @param sourceType
 * @returns {boolean}
 */
export const isRichType = (sourceType) => {
    return ['email', 'internal-note'].includes(sourceType)
}

/**
 * Return true if type supports only images as attachments (no PDF, etc.)
 * @param sourceType
 * @returns {boolean}
 */
export const acceptsOnlyImages = (sourceType) => {
    return ['chat'].includes(sourceType)
}

/**
 * Return an icon for any message source type, message channel or integration type
 * @param sourceType
 * @returns {*}
 */
export const sourceTypeToIcon = (sourceType) => {
    switch (sourceType) {
        case 'internal-note':
            return 'fa fa-fw fa-comment yellow'
        case 'email':
        case 'gmail':
            return 'fa fa-fw fa-envelope blue'
        case 'email-forward':
            return 'fa fa-fw fa-reply blue'
        case 'chat':
        case 'smooch':
        case 'smooch_inside':
            return 'fa fa-fw fa-comments purple'
        case 'api':
            return 'fa fa-fw fa-code'
        case 'phone':
        case 'ottspott-call':
            return 'fa fa-fw fa-phone'
        case 'facebook':
        case 'facebook-account':
        case 'facebook-post':
        case 'facebook-comment':
            return 'fa fa-fw fa-facebook-square blue'
        case 'facebook-message':
            return 'fa fa-fw fa-facebook-messenger blue' // custom font
        case 'system-message':
            return 'fa fa-fw fa-cog'
        case 'twitter':
            return 'fa fa-fw fa-twitter blue'
        default:
            return 'fa fa-fw fa-question'
    }
}
