import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import _find from 'lodash/find'
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

/**
 * Return the most appropriate account's info of asked channel to send a message to
 * @param channelType: type of channel to use: email, facebook, etc
 * @param channels: channels available
 * @returns {Object} the channel to use
 */
export function getChannelContactInfo(channelType, channels = []) {
    let chan = null // return null if no channel match, it's important

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

export function isAccountAddress(addressToTest = '', supportAddress = '') {
    if (!addressToTest || !supportAddress) {
        return false
    }

    const splitSupportAddress = supportAddress.split('@')

    // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
    return addressToTest === supportAddress
        || addressToTest.startsWith(`${splitSupportAddress[0]}+`) && addressToTest.endsWith(`@${splitSupportAddress[1]}`)
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
        // trying to guess if there is an address in `to` corresponding to current account support address
        // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
        const companyAnsweredInfo = _find(lastMessage.source.to, (to = {}) => {
            return isAccountAddress(to.address, supportChannel.address)
        })

        // if we found a `to` address corresponding to current support account, we use it
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
 * @param currentAccountContactInfo
 * @returns {*}
 */
export function guessReceiversFromTicket(ticket, currentAccountContactInfo) {
    let toReceivers = fromJS([])
    let ccReceivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    if (!messages.size) {
        return {
            to: []
        }
    }

    const sourceType = ticket.getIn(['newMessage', 'source', 'type'])
    const lastMessage = getLastSameSourceTypeMessage(messages, sourceType)
    const supportChannel = getChannelContactInfo(sourceType, currentAccountContactInfo)

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            toReceivers = lastMessage.getIn(['source', 'to'])
        } else {
            toReceivers = fromJS([lastMessage.getIn(['source', 'from'])])

            if (supportChannel) {
                const isSupportAddressInCc = lastMessage.getIn(['source', 'cc'], fromJS([]))
                    .some(receiver => isAccountAddress(receiver.get('address'), supportChannel.address))

                // if support address is in cc, we want `to` last message receivers to be in new message `to`
                if (isSupportAddressInCc) {
                    toReceivers = toReceivers.concat(lastMessage.getIn(['source', 'to']))
                }
            }
        }

        ccReceivers = lastMessage.getIn(['source', 'cc'], fromJS([]))
    }

    const cleanReceivers = (receivers) => {
        let newReceivers = receivers
            .filter(receiver => !!receiver) // remove falsey values

        if (supportChannel) {
            // remove current support address
            newReceivers = newReceivers.filter((receiver) => {
                return !isAccountAddress(receiver.get('address'), supportChannel.address)
            })
        }

        return newReceivers
    }

    return {
        to: cleanReceivers(toReceivers).toJS(), // remove falsey values
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
