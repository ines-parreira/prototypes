import {fromJS} from 'immutable'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _toLower from 'lodash/toLower'
import _isEqual from 'lodash/isEqual'
import _pickBy from 'lodash/pickBy'

import {SOURCE_VALUE_PROP} from '../../config'
import * as ticketConfig from '../../config/ticket'
import {EMAIL_INTEGRATION_TYPES} from '../../constants/integration'
import {getPersonLabelFromSource} from '../../pages/tickets/common/utils'
import {getActionTemplate, toImmutable} from '../../utils'
import {renderTemplate} from '../../pages/common/utils/template'

import * as responseUtils from '../newMessage/responseUtils'

import {getProperty} from './selectors'

/**
 * Get the most recent messages which have the matching sourceType
 * @param messages
 * @param sourceType
 * @returns {*}
 */
export function getLastSameSourceTypeMessage(messages, sourceType) {
    messages = ticketConfig
        .orderedMessages(messages)
        .filter((m) => !isForwardedMessage(m))
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
    messages = toImmutable(messages)
    const ticketId = messages.getIn([0, 'ticket_id'])
    if (ticketId) {
        const cachedSourceType = responseUtils.getSourceTypeCache(ticketId)
        if (cachedSourceType) {
            return cachedSourceType
        }
    }
    return ticketConfig.responseSourceType(messages)
}

/**
 * Map a source type to a channel.
 * Returns undefined for internal note as we dont have enough information to guess the channel.
 */
export function getChannelFromSourceType(sourceType, messages) {
    messages = toImmutable(messages)
    return ticketConfig.sourceTypeToChannel(sourceType, messages)
}

export function isSupportAddress(addressToTest = '', supportAddresses = fromJS([])) {
    if (!addressToTest || !supportAddresses.size) {
        return false
    }

    addressToTest = _toLower(addressToTest)

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
 * Return value prop from sender/receiver that is used to identify a person depending on the source type
 * @param sourceType
 */
export function getValuePropFromSourceType(sourceType) {
    return SOURCE_VALUE_PROP[sourceType]
}

/**
 * Guess receivers from a ticket based on its messages
 * @param ticket
 * @param newMessageSourceType
 * @param channels
 * @returns {*}
 */
export function guessReceiversFromTicket(ticket, newMessageSourceType, channels = fromJS([])) {
    let toReceivers = fromJS([])
    let ccReceivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    const supportAddresses = channels.map((channel) => channel.get('address'))
    const lastMessage = getLastSameSourceTypeMessage(messages, newMessageSourceType)

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            toReceivers = toReceivers.concat(lastMessage.getIn(['source', 'to']))
        } else {
            toReceivers = toReceivers.push(lastMessage.getIn(['source', 'from']))

            if (supportAddresses.size) {
                toReceivers = toReceivers.concat(lastMessage.getIn(['source', 'to']))
            }
        }
        ccReceivers = lastMessage.getIn(['source', 'cc'], fromJS([]))
    }

    const cleanReceivers = (receivers) => receivers
        .filter((receiver) => !!receiver) // remove falsy values
        .map((receiver) => { // set address to lowercase
            if (receiver.get('address')) {
                return receiver.update('address', _toLower)
            }

            return receiver
        })
        .filter((receiver) => { // remove support addresses
            return !isSupportAddress(receiver.get('address'), supportAddresses)
        })

    const ret = {
        to: cleanReceivers(toReceivers).toJS()
    }

    const cc = cleanReceivers(ccReceivers).toJS()

    // To avoid setting an empty `cc` field in every source
    if (cc && cc.length) {
        ret.cc = cc
    }

    // if no `to` has been found in messages, try to pick it from customer channels
    if (ret.to.length === 0) {
        // if selected type needs a `to` field
        if (!ticketConfig.isSystemType(newMessageSourceType)) {
            const newMessageChannel = ticketConfig.sourceTypeToChannel(newMessageSourceType, messages)
            const customerChannel = ticket.getIn(['customer', 'channels'], fromJS([]))
                .filter((channel) => channel.get('type') === newMessageChannel) // keep only matching channels
                .sortBy((channel) => !channel.get('preferred')) // preferred channel is now first of the list
                .first()

            if (customerChannel) {
                const receivers = fromJS([{
                    name: ticket.getIn(['customer', 'name']) || '',
                    address: customerChannel.get(getValuePropFromSourceType(newMessageSourceType)) || '',
                }])
                ret.to = cleanReceivers(receivers).toJS()
            }

        }
    }

    return ret
}

/**
 * Return receivers value (to send to server and use on UI) from state (reducers)
 * @param options
 * @param sourceType
 * @returns {*}
 */
export function receiversValueFromState(options, sourceType) {
    _forEach(options, (receivers, index) => {
        options[index] = receivers.map((receiver) => ({
            name: receiver.name || '',
            label: getPersonLabelFromSource(receiver, sourceType),
            value: receiver.address || '',
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

    _forEach(newValue, (receivers, index) => {
        newValue[index] = receivers.map((receiver) => ({
            name: receiver.name || '',
            address: receiver.value || '',
        }))
    })

    return newValue
}

/**
 * Build a partial update object from macro actions (or any crafted action with the same form)
 * @param actionNames - 'addTags', ['addTags', 'setStatus'], etc.
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
        .map((actionName) => getActionTemplate(actionName))
        .filter((config) => !!config.partialUpdateKey)
        .reduce((result, config) => {
            result[config.partialUpdateKey] = getProperty(config.partialUpdateValue)(state)
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
    let chan = channels.find((channel) => {
        return channel.get('type') === channelType && channel.get('preferred', false)
    })

    // get the first channel available
    if (!chan) {
        chan = channels.find((channel) => channel.get('type') === channelType)
    }

    return chan || fromJS({})
}


const LAST_SENDER_CHANNEL_KEY = 'lastSenderChannel'

export const persistLastSenderChannel = (channel) => {
    if (window.localStorage) {
        window.localStorage.setItem(LAST_SENDER_CHANNEL_KEY, JSON.stringify(channel.toJS()))
    }
}

export const getLastSenderChannel = () => {
    if (window.localStorage) {
        const lastSenderChannel = window.localStorage.getItem(LAST_SENDER_CHANNEL_KEY)
        if (lastSenderChannel) {
            try {
                return fromJS(JSON.parse(lastSenderChannel))
            } catch (error) {
                console.error(`Failed to decode window.localStorage."${LAST_SENDER_CHANNEL_KEY}"`, error)
            }
        }
    }
    return null
}

/**
 * Return sender based on ticket messages and available channels
 * @param ticket
 * @param newMessageSourceType
 * @param channels Available account channels (from email and gmail integrations)
 * @returns {*}
 */
export function getNewMessageSender(ticket, newMessageSourceType, channels) {
    if (newMessageSourceType === 'internal-note') {
        return fromJS({
            name: '',
            address: ''
        })
    }

    const preferredChannel = getPreferredChannel(newMessageSourceType, channels) || fromJS({})
    const lastMessage = ticket.get('messages')
        .findLast((message) => {
            const type = message.getIn(['source', 'type'], '')

            // a message can be a facebook post
            // or a comment but agent can only respond with a comment
            if (newMessageSourceType === 'facebook-comment') {
                return [newMessageSourceType, 'facebook-post'].includes(type)
            }

            return type === newMessageSourceType
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
        const lastSender = getLastSenderChannel()

        // make sure the persisted sender is in the list of channels
        if (lastSender && channels.find((c) => c.get('address') === lastSender.get('address'))) {
            return lastSender
        }
        return preferredChannel
    }

    // If we don't find a channel, we use the preferred channel
    let sender = preferredChannel

    // last message sent by the customer
    // from address of last message or preferred channel of the same type
    if (lastMessage.get('from_agent', false)) {
        sender = lastMessage.getIn(['source', 'from']) || preferredChannel

        if (!sender.isEmpty() && newMessageSourceType === 'email') {
            sender = channels.find(
                (channel) => channel.get('address') === sender.get('address')
                    && EMAIL_INTEGRATION_TYPES.includes(channel.get('type'))
            ) || preferredChannel
        }

        return sender
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

    return sender
}

/**
 * Return pending message index
 * match a newly posted message to a pending message and return it's index
 * @param pendingMessages E.g: []
 * @param message { body_html: '', ... }
 * @returns {*}
 */
export function getPendingMessageIndex(pendingMessages, message) {
    let index = -1

    if (!pendingMessages.length) {
        return index
    }

    // props that are the same in the post body and the response
    const props = [
        'body_html',
        'body_text',
        'channel',
        'from_agent',
        'source',
    ]

    const whitelist = (v, key) => props.includes(key)

    pendingMessages.some((pending, i) => {
        if (_isEqual(_pickBy(pending, whitelist), _pickBy(message, whitelist))) {
            index = i
            return true
        }
    })

    return index
}

/**
 * Return whether or not the message is forwarded
 * @param message
 * @returns {*|any|T|boolean}
 */
export function isForwardedMessage(message) {
    return toImmutable(message).getIn(['source', 'extra', 'forward']) || false
}

export const renderObject = (argument, context) => {
    let ret = argument

    if (typeof argument === 'string') {
        ret = renderTemplate(argument, context)
    } else if (typeof argument === 'object') {
        ret = argument.map((v) => renderObject(v, context))
    }

    return ret
}

export const replaceIntegrationVariables = (integrationType, ticketState, variable, newArgument, notify) => {
    let integrations = ticketState
        .getIn(['customer', 'integrations'], fromJS([]))
        .filter((integration) => {
            return integration.get('__integration_type__') === integrationType
        })

    // if we have updated_at in customer, sort integrations by the update date so we use the most recent updates
    if (!integrations.isEmpty() && integrations.first().getIn(['customer', 'updated_at'])) {
        integrations = integrations.sortBy((integration) => integration.getIn(['customer', 'updated_at'])).reverse()
    }

    const integrationIds = integrations.map((_, integrationId) => integrationId).toList()

    const integrationId = integrationIds.first()

    if (!integrationId) {
        notify({
            type: 'warning',
            title: `This customer does not have any ${integrationType} information`,
        })
        return newArgument.replace(variable, '')
    }

    const newVariable = variable.replace(`integrations.${integrationType}`, `integrations[${integrationId}]`)
    return newArgument.replace(variable, newVariable)
}

export const replaceVariables = (argument, state, notify) => {
    let ticketState = state.ticket
    let currentUserState = state.currentUser

    // If there's a var of format `ticket.customer.integrations.XXX`, then it's a dynamic variable.
    // Else, it would be `ticket.customer.integrations[XXX]`.
    let newArgument = argument
    let variables = argument.match(/{{ticket\.customer\.integrations.[\w\d\]\[._-]+\|?([\w_]+\([^(]*\))?}}/g)

    if (variables) {
        // If a variable is a dynamic variable, we try to replace `integrations.{type}` with
        // `integrations[correct-integration-id]`.
        variables.forEach((variable) => {
            ['shopify', 'recharge', 'smile'].forEach((integrationType) => {
                if (variable.includes('integrations.' + integrationType)) {
                    newArgument = replaceIntegrationVariables(integrationType, ticketState, variable, newArgument, notify)
                }
            })
        })
    }

    return renderObject(newArgument, {
        ticket: ticketState ? ticketState.toJS() : ticketState,
        current_user: currentUserState ? state.currentUser.toJS() : currentUserState,
    })
}

export const nestedReplace = (obj, state, notify) => {
    if (typeof obj === 'string') {
        return replaceVariables(obj, state, notify)
    }

    // since typeof null === 'object', we also need to verify obj is not null
    if (typeof obj === 'object' && obj !== null) {
        return obj.map((item) => nestedReplace(item, state, notify))
    }

    return obj
}
