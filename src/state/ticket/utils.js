/**
 * Get the most recent message that was not an internal note.
 * @param messages
 * @returns {*}
 */
export function getLastNonInternalNoteMessage(messages) {
    const filteredMessages = messages.filter((m) => m.getIn(['source', 'type']) !== 'internal-note')

    return !!filteredMessages.size && filteredMessages.last()
}

/**
 * Get the most recent messages which have the matching sourceType
 * @param messages
 * @param sourceType
 * @returns {*}
 */
export function getLastSameSourceTypeMessage(messages, sourceType) {
    const msg = messages.filter((m) => m.getIn(['source', 'type']) === sourceType).last()

    if (!msg && sourceType === 'facebook-comment') {
        return messages.filter((m) => m.getIn(['source', 'type']) === 'facebook-post').last()
    }

    return msg
}

/**
 * A utility function that gives the source type we should set on a **new** message based on the
 * source type of the message we're responding to.
 */
export function getSourceTypeOfResponse(messages) {
    const lastMsg = getLastNonInternalNoteMessage(messages)

    if (!lastMsg) {
        return 'api'
    }

    // some messages don't have sources - failed imports, api, etc..
    if (!lastMsg.get('source')) {
        return 'api'
    }

    switch (lastMsg.getIn(['source', 'type'])) {
        case 'facebook-post':
            return 'facebook-comment'
        default:
            return lastMsg.getIn(['source', 'type'])
    }
}


/**
 * Map a source type to a channel.
 * Returns undefined for internal note as we dont have enough information to guess the channel.
 */
export function getChannelFromSourceType(sourceType) {
    if (!sourceType) {
        return
    }

    if (sourceType.startsWith('facebook')) {
        return 'facebook'
    } else if (sourceType !== 'internal-note') {
        return sourceType
    }
}
