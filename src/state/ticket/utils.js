import {fromJS} from 'immutable'
import {SOURCE_VALUE_PROP} from '../../config'
import {displayUserNameFromSource} from '../../pages/tickets/common/utils'

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

/**
 * Return value prop from sender/requester that is used to identify a user depending on the source type
 * @param sourceType
 */
export function getValuePropFromSourceType(sourceType) {
    return SOURCE_VALUE_PROP[sourceType]
}

/**
 * Guess receivers from a ticket based on its messages
 * @param ticket
 * @returns {*}
 */
export function guessReceiversFromTicket(ticket) {
    let receivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    if (!messages.size) {
        return receivers
    }

    const sourceType = ticket.getIn(['newMessage', 'source', 'type'])
    const lastMessage = getLastSameSourceTypeMessage(messages, sourceType)

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            receivers = lastMessage.getIn(['source', 'to'])
        } else {
            receivers = fromJS([lastMessage.getIn(['source', 'from'])])
        }
    }

    return receivers.filter(receiver => !!receiver) // remove falsey values
}

export function receiversValueFromState(options, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)

    return options.map((user) => {
        return {
            id: user.id,
            name: user.name,
            label: displayUserNameFromSource(user, sourceType),
            value: user[valueProp],
        }
    })
}

export function receiversStateFromValue(value, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)

    if (!valueProp) {
        return
    }

    const newValue = value || []

    return newValue.map((user) => {
        return {
            id: user.id,
            name: user.name,
            [valueProp]: user.value
        }
    })
}
