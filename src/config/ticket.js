export const DEFAULT_CHANNEL = 'email'
export const DEFAULT_SOURCE_TYPE = 'email'

export const SYSTEM_SOURCE_TYPES = ['internal-note', 'system-message']

// source types that can not be used to answer
export const UNUSABLE_SOURCE_TYPES = ['phone', 'facebook', 'api', 'facebook-post', 'ottspott-call', 'system-message']

/**
 * Get the most recent message that was not a system-type message
 * @param messages
 * @returns {*}
 */
export function lastNonSystemTypeMessage(messages) {
    const filteredMessages = messages.filter(message => !SYSTEM_SOURCE_TYPES.includes(message.getIn(['source', 'type'])))
    return !filteredMessages.isEmpty() && filteredMessages.last()
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
