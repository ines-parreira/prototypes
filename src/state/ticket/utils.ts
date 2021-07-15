import {fromJS, Map, List} from 'immutable'
import moment from 'moment'
import _capitalize from 'lodash/capitalize'
import _forEach from 'lodash/forEach'
import _isArray from 'lodash/isArray'
import _toLower from 'lodash/toLower'
import _isEqual from 'lodash/isEqual'
import _pickBy from 'lodash/pickBy'

import {SOURCE_VALUE_PROP} from '../../config'
import {INTEGRATION_TYPE_WITH_VARIABLES} from '../../config/integrations'
import * as ticketConfig from '../../config/ticket'
import {EMAIL_INTEGRATION_TYPES} from '../../constants/integration'
import {getPersonLabelFromSource} from '../../pages/tickets/common/utils.js'
import {getActionTemplate, isImmutable, toImmutable} from '../../utils'
import {renderTemplate} from '../../pages/common/utils/template.js'
import {tryLocalStorage} from '../../services/common/utils'
import * as responseUtils from '../newMessage/responseUtils'
import {TicketVia, TicketMessageSourceType} from '../../business/types/ticket'
import {PHONE_EVENTS} from '../../constants/event'
import {notify as notifyAction} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import {RootState} from '../types'
import {TicketMessage} from '../../models/ticket/types'

import {getProperty} from './selectors'

type Receivers = {
    cc?: {
        name: string
        address: string
        value?: string
    }[]
    to: {
        name: string
        address: string
        value?: string
    }[]
}

/**
 * Get the most recent messages which have the matching sourceType
 */
export function getLastSameSourceTypeMessage(
    messages: List<any>,
    sourceType: string
) {
    const msg = ticketConfig
        .orderedMessages(messages)
        .filter((m) => !isForwardedMessage(m))
        .filter(
            (m: Map<any, any>) => m.getIn(['source', 'type']) === sourceType
        )
        .last() as Map<any, any>

    if (!msg && sourceType === TicketMessageSourceType.FacebookComment) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.FacebookPost
            )
            .last() as Map<any, any>
    } else if (
        !msg &&
        sourceType === TicketMessageSourceType.FacebookMentionComment
    ) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.FacebookMentionPost
            )
            .last() as Map<any, any>
    } else if (
        !msg &&
        sourceType === TicketMessageSourceType.FacebookReviewComment
    ) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.FacebookReview
            )
            .last() as Map<any, any>
    } else if (
        !msg &&
        sourceType === TicketMessageSourceType.InstagramMentionComment
    ) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.InstagramMentionMedia
            )
            .last() as Map<any, any>
    }

    return msg
}

/**
 * A utility function that gives the source type we should set on a **new** message based on the
 * source type of the message we're responding to.
 */
export function getSourceTypeOfResponse(
    messages: List<any> | any[],
    via: TicketVia
) {
    const immutableMessages: List<any> = isImmutable(messages)
        ? (messages as List<any>)
        : toImmutable(messages)
    const ticketId = immutableMessages.getIn([0, 'ticket_id'])
    if (ticketId) {
        const cachedSourceType = responseUtils.getSourceTypeCache(ticketId)
        if (cachedSourceType) {
            return cachedSourceType
        }
    }
    return ticketConfig.responseSourceType(immutableMessages.toJS(), via)
}

/**
 * Map a source type to a channel.
 * Returns undefined for internal note as we dont have enough information to guess the channel.
 */
export function getChannelFromSourceType(
    sourceType: TicketMessageSourceType,
    messages: List<any> | any[]
) {
    return ticketConfig.sourceTypeToChannel(sourceType, toImmutable(messages))
}

export function isSupportAddress(
    addressToTest = '',
    supportAddresses: List<any> = fromJS([])
) {
    if (!addressToTest || !supportAddresses.size) {
        return false
    }
    const formattedAddress = _toLower(addressToTest)

    for (const supportAddress of supportAddresses as any) {
        const splitSupportAddress = (supportAddress as string).split('@')

        // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
        if (
            formattedAddress === supportAddress ||
            (formattedAddress.startsWith(`${splitSupportAddress[0]}+`) &&
                formattedAddress.endsWith(`@${splitSupportAddress[1]}`))
        ) {
            return true
        }
    }
}

/**
 * Return value prop from sender/receiver that is used to identify a person depending on the source type
 */
export function getValuePropFromSourceType(
    sourceType: TicketMessageSourceType
) {
    return SOURCE_VALUE_PROP[sourceType as keyof typeof SOURCE_VALUE_PROP]
}

/**
 * Guess receivers from a ticket based on its messages
 */
export function guessReceiversFromTicket(
    ticket: Map<any, any>,
    newMessageSourceType: TicketMessageSourceType,
    channels: List<any> = fromJS([])
) {
    let toReceivers: List<any> = fromJS([])
    let ccReceivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    const supportAddresses = channels.map(
        (channel: Map<any, any>) => channel.get('address') as string
    ) as List<any>
    const lastMessage = getLastSameSourceTypeMessage(
        messages,
        newMessageSourceType
    )

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            toReceivers = toReceivers.concat(
                lastMessage.getIn(['source', 'to'])
            ) as List<any>
        } else {
            toReceivers = toReceivers.push(
                lastMessage.getIn(['source', 'from'])
            )

            // Related issue: https://github.com/gorgias/gorgias/issues/4620
            if (supportAddresses.size) {
                toReceivers = toReceivers.concat(
                    lastMessage.getIn(['source', 'to'])
                ) as List<any>
            }
        }
        ccReceivers = lastMessage.getIn(['source', 'cc'], fromJS([]))
    }

    const cleanReceivers = (receivers: List<any>) =>
        receivers
            .filter((receiver) => !!receiver) // remove falsy values
            .map((receiver: Map<any, any>) => {
                // set address to lowercase
                if (receiver.get('address')) {
                    return receiver.update('address', _toLower)
                }

                return receiver
            })
            .filter((receiver) => {
                // remove support addresses
                return !isSupportAddress(
                    receiver!.get('address'),
                    supportAddresses
                )
            })

    const ret: Receivers = {
        to: cleanReceivers(toReceivers).toJS(),
    }

    const cc: {name: string; address: string}[] | undefined = cleanReceivers(
        ccReceivers
    ).toJS()

    // To avoid setting an empty `cc` field in every source
    if (cc && cc.length) {
        ret.cc = cc
    }

    // if no `to` has been found in messages, try to pick it from customer channels
    if (ret.to.length === 0) {
        // if selected type needs a `to` field
        if (!ticketConfig.isSystemType(newMessageSourceType)) {
            const newMessageChannel = ticketConfig.sourceTypeToChannel(
                newMessageSourceType,
                messages
            )
            const customerChannel = (ticket.getIn(
                ['customer', 'channels'],
                fromJS([])
            ) as List<any>)
                .filter(
                    (channel: Map<any, any>) =>
                        channel.get('type') === newMessageChannel
                ) // keep only matching channels
                .sortBy((channel: Map<any, any>) => !channel.get('preferred')) // preferred channel is now first of the list
                .first() as Map<any, any> | undefined

            if (customerChannel) {
                const receivers = fromJS([
                    {
                        name: ticket.getIn(['customer', 'name']) || '',
                        address:
                            customerChannel.get(
                                getValuePropFromSourceType(newMessageSourceType)
                            ) || '',
                    },
                ])
                ret.to = cleanReceivers(receivers).toJS()
            }
        }
    }

    return ret
}

/**
 * Return receivers value (to send to server and use on UI) from state (reducers)
 */
export function receiversValueFromState(
    options: Receivers,
    sourceType: string
) {
    _forEach(options, (receivers, index) => {
        // @ts-ignore
        options[index] = receivers!.map((receiver) => ({
            name: receiver.name || '',
            label: getPersonLabelFromSource(receiver, sourceType),
            value: receiver.address || '',
        }))
    })

    return options
}

/**
 * Return receivers state (reducers) from value (to send to server and use on UI)
 */
export function receiversStateFromValue(
    value: Receivers,
    sourceType: TicketMessageSourceType
) {
    const valueProp = getValuePropFromSourceType(sourceType)

    if (!valueProp) {
        return {}
    }

    const newValue = value || {}

    _forEach(newValue, (receivers, index) => {
        // @ts-ignore
        newValue[index] = receivers!.map((receiver) => ({
            name: receiver.name || '',
            address: receiver.value || '',
        }))
    })

    return newValue
}

/**
 * Build a partial update object from macro actions (or any crafted action with the same form)
 */
export function buildPartialUpdateFromAction(
    actionNames: string | string[],
    state: RootState
) {
    if (!state) {
        return {}
    }
    const formattedActionNames = !_isArray(actionNames)
        ? [actionNames]
        : actionNames

    return formattedActionNames
        .map((actionName) => getActionTemplate(actionName))
        .filter((config) => !!config!.partialUpdateKeys)
        .reduce((result: Record<string, Map<any, any>>, config) => {
            const keys = config!.partialUpdateKeys
            const values = config!.partialUpdateValues
            if (Array.isArray(keys)) {
                ;(config!.partialUpdateKeys as string[]).forEach(
                    (key, idx) =>
                        (result[key] = getProperty(values[idx])(state))
                )
            } else {
                result[keys] = getProperty(values)(state)
            }
            return result
        }, {})
}

/**
 * Return preferred channel of account
 * return first available channels as a fallback
 */
export function getPreferredChannel(
    channelType: TicketMessageSourceType,
    channels: List<any>
) {
    // get the preferred channel
    let chan: Map<any, any> | undefined = channels.find(
        (channel: Map<any, any>) => {
            return (
                channel.get('type') === channelType &&
                (channel.get('preferred', false) as boolean)
            )
        }
    )

    // get the first channel available
    if (!chan) {
        chan = channels.find(
            (channel: Map<any, any>) => channel.get('type') === channelType
        )
    }

    return chan || (fromJS({}) as Map<any, any>)
}

const LAST_SENDER_CHANNEL_KEY = 'lastSenderChannel'

export const persistLastSenderChannel = (channel: Map<any, any>) => {
    tryLocalStorage(() => {
        window.localStorage.setItem(
            LAST_SENDER_CHANNEL_KEY,
            JSON.stringify(channel.toJS())
        )
    })
}

export const getLastSenderChannel = () => {
    if (window.localStorage) {
        const lastSenderChannel = window.localStorage.getItem(
            LAST_SENDER_CHANNEL_KEY
        )
        if (lastSenderChannel) {
            try {
                return fromJS(JSON.parse(lastSenderChannel)) as Map<any, any>
            } catch (error) {
                console.error(
                    `Failed to decode window.localStorage."${LAST_SENDER_CHANNEL_KEY}"`,
                    error
                )
            }
        }
    }
    return null
}

export function getOutboundCallFrom(
    ticket: Map<any, any>,
    channels: List<any>
) {
    if (!channels.size) {
        return fromJS({
            id: null,
            name: '',
            address: '',
        }) as Map<any, any>
    }

    const events: List<any> = ticket.get('events') || fromJS([])
    const phoneEvents = events.filter((event: Map<any, any>) =>
        PHONE_EVENTS.includes(event.get('type'))
    )

    if (!phoneEvents.size) {
        return channels.get(0) as Map<any, any>
    }

    const lastIndex = phoneEvents.size - 1
    const lastEvent = phoneEvents.get(lastIndex) as Map<any, any>
    const integrationId = lastEvent.getIn(['data', 'integration', 'id'])
    const channel = channels.find(
        (channel: Map<any, any>) => channel.get('id') === integrationId
    ) as Map<any, any> | undefined

    return channel || (channels.get(0) as Map<any, any>)
}

/**
 * Return sender based on ticket messages and available channels
 */
export function getNewMessageSender(
    ticket: Map<any, any>,
    newMessageSourceType: TicketMessageSourceType,
    channels: List<any>
) {
    if (newMessageSourceType === 'internal-note') {
        return fromJS({
            name: '',
            address: '',
        }) as Map<any, any>
    }

    if (newMessageSourceType === TicketMessageSourceType.Phone) {
        return getOutboundCallFrom(ticket, channels)
    }

    const preferredChannel =
        getPreferredChannel(newMessageSourceType, channels) || fromJS({})
    const lastMessage: Map<any, any> | undefined = (ticket.get(
        'messages'
    ) as List<any>).findLast((message: Map<any, any>) => {
        const type = message.getIn(['source', 'type'], '')

        // a message can be a facebook post
        // or a comment but agent can only respond with a comment
        if (newMessageSourceType === TicketMessageSourceType.FacebookComment) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.FacebookPost,
            ].includes(type)
        } else if (
            newMessageSourceType ===
            TicketMessageSourceType.FacebookReviewComment
        ) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.FacebookReview,
            ].includes(type)
        } else if (
            newMessageSourceType ===
            TicketMessageSourceType.InstagramMentionComment
        ) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.InstagramMentionMedia,
            ].includes(type)
        }

        return type === newMessageSourceType
    })

    // smooch, messenger
    // because channels only list email addresses
    if (preferredChannel.isEmpty()) {
        if (!lastMessage) {
            return fromJS({}) as Map<any, any>
        }

        if (lastMessage.get('from_agent')) {
            return lastMessage.getIn(['source', 'from']) as Map<any, any>
        }
        return lastMessage.getIn(['source', 'to', 0]) as Map<any, any>
    }

    // new ticket
    if (!lastMessage) {
        const lastSender = getLastSenderChannel()

        // make sure the persisted sender is in the list of channels
        if (
            lastSender &&
            channels.find(
                (c: Map<any, any>) =>
                    c.get('address') === lastSender.get('address')
            )
        ) {
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
            sender =
                channels.find(
                    (channel: Map<any, any>) =>
                        channel.get('address') === sender.get('address') &&
                        EMAIL_INTEGRATION_TYPES.includes(channel.get('type'))
                ) || preferredChannel
        }

        return sender
    }

    // last message sent by an agent
    // search in recipients of `to` and `cc` fields to match with an email of account channels
    const receivers = (lastMessage.getIn(['source', 'to'], fromJS([])) as List<
        any
    >).concat(lastMessage.getIn(['source', 'cc'], fromJS([]))) as List<any>
    for (const receiver of (receivers as unknown) as any[]) {
        for (const channel of (channels as unknown) as any[]) {
            if (
                (receiver as Map<any, any>).get('address') ===
                (channel as Map<any, any>).get('address')
            ) {
                return channel as Map<any, any>
            }
        }
    }

    return sender
}

/**
 * Return pending message index
 * match a newly posted message to a pending message and return it's index
 */
export function getPendingMessageIndex(
    pendingMessages: TicketMessage[],
    message: TicketMessage
) {
    let index = -1

    if (!pendingMessages.length) {
        return index
    }

    // props that are the same in the post body and the response
    const props = ['body_html', 'body_text', 'channel', 'from_agent', 'source']

    const whitelist = (v: string, key: string) => props.includes(key)

    pendingMessages.some((pending, i) => {
        if (
            _isEqual(_pickBy(pending, whitelist), _pickBy(message, whitelist))
        ) {
            index = i
            return true
        }
    })

    return index
}

/**
 * Return whether or not the message is forwarded
 */
export function isForwardedMessage(message: Map<any, any> | TicketMessage) {
    return (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ((toImmutable(message) as Map<any, any>).getIn([
            'source',
            'extra',
            'forward',
        ]) as boolean) || false
    )
}

export const renderObject = (
    argument: string | Map<any, any>,
    context: Record<string, string>
) => {
    let ret = argument

    if (typeof argument === 'string') {
        ret = renderTemplate(argument, context)
    } else if (typeof argument === 'object') {
        ret = argument.map((v) => renderObject(v, context)) as Map<any, any>
    }

    return ret
}

export const replaceIntegrationVariables = (
    integrationType: string,
    ticketState: Map<any, any>,
    variable: string,
    newArgument: string,
    notify?: typeof notifyAction
) => {
    let integrations = (ticketState.getIn(
        ['customer', 'integrations'],
        fromJS([])
    ) as List<any>).filter((integration: Map<any, any>) => {
        return integration.get('__integration_type__') === integrationType
    })

    // if we have updated_at in customer, sort integrations by the update date so we use the most recent updates
    if (
        !integrations.isEmpty() &&
        (integrations.first() as Map<any, any>).getIn([
            'customer',
            'updated_at',
        ])
    ) {
        integrations = integrations
            .sortBy(
                (integration: Map<any, any>) =>
                    integration.getIn(['customer', 'updated_at']) as string
            )
            .reverse()
    }

    const integrationIds = integrations
        .map((_, integrationId) => integrationId)
        .toList()

    const integrationId = integrationIds.first()

    if (!integrationId && notify) {
        notify({
            type: NotificationStatus.Warning,
            title: `This customer does not have any ${_capitalize(
                integrationType
            )} information`,
        })
        return newArgument.replace(variable, '')
    }

    const variableConfig = ticketConfig.getVariableWithValue(variable)
    let newVariable = variable.replace(
        `integrations.${integrationType}`,
        `integrations[${integrationId!}]`
    )

    if (variableConfig && variableConfig.replace != null) {
        newVariable = variableConfig.replace(
            fromJS({ticket: ticketState}),
            integrationId
        )
    }

    return newArgument.replace(variable, newVariable)
}

export const replaceVariables = (
    argument: string,
    ticket: Map<any, any> | null,
    currentUser: Map<any, any> | null,
    notify?: typeof notifyAction
) => {
    // If there's a var of format `ticket.customer.integrations.XXX`, then it's a dynamic variable.
    // Else, it would be `ticket.customer.integrations[XXX]`.
    let newArgument = argument
    const variables = argument.match(
        /{{ticket\.customer\.integrations.[\w\d\]\[._-]+\|?([\w_]+\([^(]*\))?}}/g
    )

    if (variables) {
        // If a variable is a dynamic variable, we try to replace `integrations.{type}` with
        // `integrations[correct-integration-id]`.
        variables.forEach((variable) => {
            INTEGRATION_TYPE_WITH_VARIABLES.forEach((integrationType) => {
                if (variable.includes('integrations.' + integrationType)) {
                    newArgument = replaceIntegrationVariables(
                        integrationType,
                        ticket!,
                        variable,
                        newArgument,
                        notify
                    )
                }
            })
        })
    }

    return renderObject(newArgument, {
        ticket: ticket ? ticket.toJS() : ticket,
        current_user: currentUser ? currentUser.toJS() : currentUser,
    })
}

export const nestedReplace = (
    obj: unknown,
    ticketState: Map<any, any>,
    currentUserState: Map<any, any>,
    notify?: typeof notifyAction
): unknown => {
    if (typeof obj === 'string') {
        return replaceVariables(obj, ticketState, currentUserState, notify)
    }

    // since typeof null === 'object', we also need to verify obj is not null
    if (typeof obj === 'object' && obj !== null) {
        return (obj as Map<any, any>).map((item) =>
            nestedReplace(item, ticketState, currentUserState, notify)
        ) as Map<any, any>
    }

    return obj
}

export const parseTimedelta = (timedelta: string) => {
    const timedeltaRegex = /^(?<value>\d+)(?<unit>[mhd])$/
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const groups = timedelta.match(timedeltaRegex)?.groups
    if (groups) {
        const {value, unit} = groups
        return moment.duration(Number(value), unit as any)
    }
    throw new Error(`${timedelta} is not a properly formatted timedelta`)
}
