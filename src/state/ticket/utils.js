import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import _find from 'lodash/find'
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
 * Return the most appropriate account's info of asked channel to send a message to
 * @param channelType: type of channel to use: email, facebook, etc
 * @param channels: channels available
 * @returns {string} the channel to use
 */
export function getChannelContactInfo(channelType, channels = []) {
    let chan = null

    if (channelType === 'internal-note') {
        return {}
    }

    for (const channel of channels) {
        if (channel.type === channelType) {
            if (channel.preferred) {
                return {
                    name: channel.name,
                    address: channel.address
                }
            }
            chan = {
                name: channel.name,
                address: channel.address
            }
        }
    }

    return chan
}

/**
 * Return `from` contact info when creating a new message based on ticket last eligible message
 * @param channelType
 * @param currentAccountContactInfo
 * @param lastMessage
 * @returns {*}
 */
export function getSenderContactInfo(channelType, currentAccountContactInfo, lastMessage) {
    const supportChannel = getChannelContactInfo(channelType, currentAccountContactInfo)

    // if there is no message, default support channel is used
    // if there is a message:
    //  - if message is from an agent, previous `from` field is used
    //  - else if there is support channel, search in `to` field addresses to find support channel information
    //  otherwise default support channel is used
    //  - else, previous `to` field is used
    if (!lastMessage || !lastMessage.source) {
        return supportChannel
    } else if (lastMessage.from_agent) {
        return lastMessage.source.from
    } else if (supportChannel) {
        const splitSupportAddress = supportChannel.address.split('@')

        // trying to guess if there is an address in `to` corresponding to current account support address
        // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
        const companyAnsweredInfo = _find(lastMessage.source.to, (to = {}) => {
            const address = to.address || ''
            return address.startsWith(splitSupportAddress[0]) && address.endsWith(`@${splitSupportAddress[1]}`)
        })

        // if we found an `to` address corresponding to current support account, we use it
        if (companyAnsweredInfo) {
            return {
                name: companyAnsweredInfo.name || supportChannel.name,
                address: companyAnsweredInfo.address
            }
        } else {
            return supportChannel
        }
    } else {
        return _pick(lastMessage.source.to[0], ['name', 'address'])
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
        return []
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
