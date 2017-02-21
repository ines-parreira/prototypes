import {fromJS} from 'immutable'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import {SOURCE_VALUE_PROP, SYSTEM_TYPES} from '../../config'
import {displayUserNameFromSource} from '../../pages/tickets/common/utils'
import {getActionTemplate} from '../../utils'

/**
 * Get the most recent message that was not an internal note.
 * @param messages
 * @returns {*}
 */
export function getLastNonSystemTypeMessage(messages) {
    const filteredMessages = messages.filter((m) => !SYSTEM_TYPES.includes(m.getIn(['source', 'type'])))

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
    const lastMsg = getLastNonSystemTypeMessage(messages)

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

export function isSupportAddress(addressToTest = '', supportAddresses = fromJS([])) {
    if (!addressToTest || !supportAddresses.size) {
        return false
    }
    for (const supportAddress of supportAddresses) {
        const splitSupportAddress = supportAddress.split('@')

        // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
        if (addressToTest === supportAddress ||
            addressToTest.startsWith(`${splitSupportAddress[0]}+`) &&
            addressToTest.endsWith(`@${splitSupportAddress[1]}`)) {
            return true
        }
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
 * @param channels
 * @returns {*}
 */
export function guessReceiversFromTicket(ticket, channels = fromJS([])) {
    let toReceivers = fromJS([])
    let ccReceivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    if (!messages.size) {
        return {
            to: []
        }
    }

    const supportAddresses = channels.map(channel => channel.get('address'))
    const sourceType = ticket.getIn(['newMessage', 'source', 'type'])
    const lastMessage = getLastSameSourceTypeMessage(messages, sourceType)

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            toReceivers = lastMessage.getIn(['source', 'to'])
        } else {
            toReceivers = toReceivers.push(lastMessage.getIn(['source', 'from']))

            if (supportAddresses.size) {
                toReceivers = toReceivers.concat(lastMessage.getIn(['source', 'to']))
            }
        }
        ccReceivers = lastMessage.getIn(['source', 'cc'], fromJS([]))
    }

    // remove our support addresses of the receivers
    const cleanReceivers = receivers => receivers.filter(receiver => {
        return !isSupportAddress(receiver.get('address'), supportAddresses)
    })

    return {
        to: cleanReceivers(toReceivers).toJS(),
        cc: cleanReceivers(ccReceivers).toJS(),
    }
}

/**
 * Return receivers value (to send to server and use on UI) from state (reducers)
 * @param options
 * @param sourceType
 * @returns {*}
 */
export function receiversValueFromState(options, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)

    _forEach(options, (users, index) => {
        options[index] = users.map((user) => ({
            id: user.id,
            name: user.name,
            label: displayUserNameFromSource(user, sourceType),
            value: user[valueProp],
        }))
    })

    return options
}

/**
 * Return receivers state (reducers) from value (to send to server and use on UI)
 * @param value
 * @param sourceType
 * @returns {*}
 */
export function receiversStateFromValue(value, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)

    if (!valueProp) {
        return {}
    }

    const newValue = value || {}

    _forEach(newValue, (users, index) => {
        newValue[index] = users.map((user) => ({
            id: user.id,
            name: user.name,
            [valueProp]: user.value
        }))
    })

    return newValue
}

/**
 * Build a partial update object from macro actions (or any crafted action with the same form)
 * @param actionNames - 'addTags', 'setPriority', ['addTags', 'setStatus'], etc.
 * @param state - reducer state
 * @returns {*} - ex: {tags: [{name: 'refund'}], status: 'open'}
 */
export function buildPartialUpdateFromAction(actionNames, state) {
    if (!state) {
        return {}
    }

    if (!_isArray(actionNames)) {
        actionNames = [actionNames]
    }

    return actionNames
        .map(actionName => getActionTemplate(actionName))
        .filter(config => !!config.partialUpdateKey)
        .reduce((result, config) => {
            result[config.partialUpdateKey] = config.partialUpdateValue(state)
            return result
        }, {})
}

/**
 * Return preferred channel of account
 * return first available channels as a fallback
 * @param channelType E.g: email, messenger
 * @param channels Available account channels (from email and gmail integrations)
 * @returns {*}
 */
export function getPreferredChannel(channelType, channels) {
    // get the preferred channel
    let chan = channels.find(channel => {
        return channel.get('type') === channelType && channel.get('preferred', false)
    })

    // get the first channel available
    if (!chan) {
        chan = channels.find(channel => channel.get('type') === channelType)
    }

    return chan || fromJS({})
}

/**
 * Return sender based on ticket messages and available channels
 * @param ticket
 * @param channels Available account channels (from email and gmail integrations)
 * @returns {*}
 */
export function getNewMessageSender(ticket, channels) {
    const channelType = ticket.getIn(['newMessage', 'source', 'type'], '')

    if (channelType === 'internal-note') {
        return fromJS({})
    }

    const preferredChannel = getPreferredChannel(channelType, channels) || fromJS({})
    const lastMessage = ticket.get('messages')
        .findLast(message => {
            const type = message.getIn(['source', 'type'], '')

            // a message can be a facebook post
            // or a comment but agent can only respond with a comment
            if (channelType === 'facebook-comment') {
                return [channelType, 'facebook-post'].includes(type)
            }

            return type === channelType
        })

    // smooch, messenger
    // because channels only list email addresses
    if (preferredChannel.isEmpty()) {
        if (!lastMessage) {
            return fromJS({})
        }

        if (lastMessage.get('from_agent')) {
            return lastMessage.getIn(['source', 'from'])
        }
        return lastMessage.getIn(['source', 'to', 0])
    }

    // new ticket
    if (!lastMessage) {
        return preferredChannel
    }

    // last message sent by the customer
    // from address of last message or preferred channel of the same type
    if (lastMessage.get('from_agent', false)) {
        return lastMessage.getIn(['source', 'from'], preferredChannel)
    }

    // last message sent by an agent
    // search in recipients of `to` and `cc` fields to match with an email of account channels
    const receivers = lastMessage.getIn(['source', 'to'], fromJS([]))
        .concat(lastMessage.getIn(['source', 'cc'], fromJS([])))
    for (const receiver of receivers) {
        for (const channel of channels) {
            if (receiver.get('address') === channel.get('address')) {
                return channel
            }
        }
    }

    // no channels found so, we use the preferred channel
    return preferredChannel
}
