import { tryLocalStorage } from '@repo/browser-storage'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _isArray from 'lodash/isArray'
import _isEqual from 'lodash/isEqual'
import _pick from 'lodash/pick'

import { appQueryClient } from 'api/queryClient'
import { humanize } from 'business/format'
import type { TicketVia } from 'business/types/ticket'
import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import { isImmutable, toImmutable } from 'common/utils'
import { MacroActionName } from 'models/macroAction/types'
import {
    isGorgiasContactFormTicketMeta,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'
import type { TicketMessage } from 'models/ticket/types'
import type { UseListVoiceCalls } from 'models/voiceCall/queries'
import { voiceCallsKeys } from 'models/voiceCall/queries'
import { formatPhoneNumberInternational } from 'pages/phoneNumbers/utils'
import { getPersonLabelFromSource } from 'pages/tickets/common/utils'
import type { ChannelIdentifier, ChannelLike } from 'services/channels'
import { toChannel } from 'services/channels'
import type { AccountSettingDefaultIntegration } from 'state/currentAccount/types'
import * as responseUtils from 'state/newMessage/responseUtils'
import type { RootState } from 'state/types'
import {
    getValuePropFromSourceType,
    isForwardedMessage,
    isPhoneBasedSource,
    isSystemType,
    normalizeAddress,
    orderedMessages,
    responseSourceType,
    sourceTypeToChannel,
} from 'tickets/common/utils'
import { getActionTemplate } from 'utils'

import { EMPTY_SENDER, TICKET_CHANNEL_NAMES } from './constants'
import { getProperty } from './selectors'

export type Receiver = {
    name: string | null
    address: string
    value?: string
    id?: number
}

export type Receivers = {
    cc?: Receiver[]
    to: Receiver[]
}

export type ReceiverValue = {
    name: string
    label: string
    value: string
    id?: number
}

export type ReceiversValue = {
    cc?: ReceiverValue[]
    to: ReceiverValue[]
}

/**
 * Get the most recent messages which have the matching sourceType
 */
export function getLastSameSourceTypeMessage(
    messages: List<any>,
    sourceType: string,
) {
    let sourceTypesToSearch = [sourceType]

    if (sourceType === TicketMessageSourceType.TwitterTweet) {
        sourceTypesToSearch = [
            TicketMessageSourceType.TwitterTweet,
            TicketMessageSourceType.TwitterQuotedTweet,
            TicketMessageSourceType.TwitterMentionTweet,
        ]
    } else if (
        sourceType === TicketMessageSourceType.Twilio ||
        sourceType === TicketMessageSourceType.Phone ||
        sourceType === TicketMessageSourceType.Sms
    ) {
        sourceTypesToSearch = [
            TicketMessageSourceType.Twilio,
            TicketMessageSourceType.Phone,
            TicketMessageSourceType.Sms,
        ]
    }

    const msg = orderedMessages(messages)
        .filter((m) => !isForwardedMessage(m))
        .filter((m: Map<any, any>) =>
            sourceTypesToSearch.includes(m.getIn(['source', 'type'], '')),
        )
        .last() as Map<any, any>

    // TODO(@ionut): Refactor all of the below if-else if statements to use the same approach as Twitter
    //  for better readability
    if (!msg && sourceType === TicketMessageSourceType.FacebookComment) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.FacebookPost,
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
                    TicketMessageSourceType.FacebookMentionPost,
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
                    TicketMessageSourceType.FacebookReview,
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
                    TicketMessageSourceType.InstagramMentionMedia,
            )
            .last() as Map<any, any>
    } else if (
        !msg &&
        sourceType === TicketMessageSourceType.YotpoReviewPublicComment
    ) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.YotpoReview,
            )
            .last() as Map<any, any>
    } else if (
        !msg &&
        sourceType === TicketMessageSourceType.YotpoReviewPrivateComment
    ) {
        return messages
            .filter(
                (m: Map<any, any>) =>
                    m.getIn(['source', 'type']) ===
                    TicketMessageSourceType.YotpoReview,
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
    via: TicketVia,
    ticketId: string | number,
) {
    const immutableMessages: List<any> = isImmutable(messages)
        ? messages
        : toImmutable(messages)
    if (ticketId) {
        const cachedSourceType = responseUtils.getSourceTypeCache(
            typeof ticketId === 'string' ? ticketId : ticketId.toString(),
        )
        if (cachedSourceType) {
            return cachedSourceType
        }
    }
    return responseSourceType(
        immutableMessages.toJS(),
        via,
        typeof ticketId === 'string' ? parseInt(ticketId) : ticketId,
    )
}

export function isSupportAddress(
    addressToTest: string,
    supportAddresses: string[] = [],
    sourceType: TicketMessageSourceType = TicketMessageSourceType.Email,
): boolean {
    if (!addressToTest) {
        return false
    }

    const formattedAddress = normalizeAddress(addressToTest, sourceType)

    for (const supportAddress of supportAddresses
        .filter(Boolean)
        .map((address) => normalizeAddress(address, sourceType))) {
        if (formattedAddress === supportAddress) {
            return true
        }

        const splitSupportAddress = supportAddress.split('@')

        // ex: if support@acme.io is the support address, we search for it but also for support+something@acme.io
        if (
            formattedAddress.startsWith(`${splitSupportAddress[0]}+`) &&
            formattedAddress.endsWith(`@${splitSupportAddress[1]}`)
        ) {
            return true
        }
    }

    return false
}

export function cleanReceivers(
    receiversList: List<any>,
    supportAddresses: List<any>,
    sourceType: TicketMessageSourceType,
): Receiver[] {
    const receivers = receiversList.toJS() ?? []

    if (!_isArray(receivers)) {
        return []
    }

    return receivers
        .filter(isReceiver)
        .map((receiver) => ({
            ...receiver,
            address: normalizeAddress(receiver.address, sourceType),
        }))
        .filter((receiver) => {
            return !isSupportAddress(
                receiver.address,
                supportAddresses.toJS(),
                sourceType,
            )
        })
}

/**
 * Guess receivers from a ticket based on its messages
 */
export function guessReceiversFromTicket(
    ticket: Map<any, any>,
    newMessageSourceType: TicketMessageSourceType,
    channels: List<any> = fromJS([]),
) {
    let toReceivers: List<any> = fromJS([])
    let ccReceivers = fromJS([])
    const messages = ticket.get('messages', fromJS([]))

    const supportAddresses = channels.map(
        (channel: Map<any, any>) => channel.get('address') as string,
    ) as List<any>
    const lastMessage = getLastSameSourceTypeMessage(
        messages,
        newMessageSourceType,
    )

    if (lastMessage) {
        if (lastMessage.get('from_agent')) {
            toReceivers = toReceivers.concat(
                lastMessage.getIn(['source', 'to']),
            ) as List<any>
        } else {
            toReceivers = toReceivers.push(
                lastMessage.getIn(['source', 'from']),
            )

            // Related issue: https://github.com/gorgias/gorgias/issues/4620
            if (supportAddresses.size) {
                toReceivers = toReceivers.concat(
                    lastMessage.getIn(['source', 'to']),
                ) as List<any>
            }
        }
        ccReceivers = lastMessage.getIn(['source', 'cc'], fromJS([]))
    }

    const ret: Receivers = {
        to: cleanReceivers(toReceivers, supportAddresses, newMessageSourceType),
    }

    const cc: Receiver[] = cleanReceivers(
        ccReceivers,
        supportAddresses,
        newMessageSourceType,
    )

    // To avoid setting an empty `cc` field in every source
    if (cc && cc.length) {
        ret.cc = cc
    }

    // if no `to` has been found in messages, try to pick it from customer channels
    if (ret.to.length === 0) {
        // if selected type needs a `to` field
        if (!isSystemType(newMessageSourceType)) {
            const newMessageChannel =
                newMessageSourceType === TicketMessageSourceType.Sms
                    ? TicketChannel.Phone
                    : sourceTypeToChannel(newMessageSourceType, messages)
            const customerChannel = (
                ticket.getIn(['customer', 'channels'], fromJS([])) as List<any>
            )
                .filter(
                    (channel: Map<any, any>) =>
                        channel.get('type') === newMessageChannel,
                ) // keep only matching channels
                .sortBy((channel: Map<any, any>) => !channel.get('preferred')) // preferred channel is now first of the list
                .first() as Map<any, any> | undefined

            if (customerChannel) {
                const receivers = fromJS([
                    {
                        name: ticket.getIn(['customer', 'name']) || '',
                        address:
                            customerChannel.get(
                                getValuePropFromSourceType(
                                    newMessageSourceType,
                                ),
                            ) || '',
                    },
                ])
                ret.to = cleanReceivers(
                    receivers,
                    supportAddresses,
                    newMessageSourceType,
                )
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
    sourceType: TicketMessageSourceType,
) {
    return Object.entries(options).reduce((acc, [key, receivers]) => {
        acc[key as keyof ReceiversValue] = receivers.map((receiver) => ({
            name: receiver.name || '',
            label: getPersonLabelFromSource(receiver, sourceType),
            value: receiver.address || '',
            id: receiver.id,
        }))
        return acc
    }, {} as ReceiversValue)
}

/**
 * Return receivers state (reducers) from value (to send to server and use on UI)
 */
export function receiversStateFromValue(
    value: ReceiversValue,
    sourceType: TicketMessageSourceType,
): Record<never, unknown> | Receivers {
    const valueProp = getValuePropFromSourceType(sourceType)

    if (!valueProp) {
        return {}
    }

    const newValue = value || {}

    return Object.entries(newValue).reduce((acc, [key, receivers]) => {
        acc[key as keyof Receivers] = receivers.map((receiver) => ({
            ...(receiver.id ? { id: receiver.id } : {}),
            name: receiver.name || '',
            address: receiver.value || '',
        }))
        return acc
    }, {} as Receivers)
}

/**
 * Build a partial update object from macro actions (or any crafted action with the same form)
 */
export function buildPartialUpdateFromAction(
    actionNames: string | string[],
    state: RootState,
) {
    if (!state) {
        return {}
    }
    const formattedActionNames = !_isArray(actionNames)
        ? [actionNames]
        : actionNames

    return formattedActionNames
        .map((actionName) => getActionTemplate(actionName)!)
        .filter((config) => !!config.partialUpdateKeys)
        .reduce((result: Record<string, Map<any, any>>, config) => {
            const keys = config.partialUpdateKeys
            const values = config.partialUpdateValues
            if (Array.isArray(keys)) {
                keys.forEach(
                    (key, idx) =>
                        (result[key] = getProperty((values as string[])[idx])(
                            state,
                        )),
                )
            } else if (typeof keys === 'string') {
                result[keys] = getProperty(values as string)(state)
            }
            return result
        }, {})
}

/**
 * Return preferred channel of account
 * return first available channels as a fallback
 */
export function getPreferredChannel(
    channelType: TicketMessageSourceType | TicketChannel,
    channels: List<any>,
) {
    // get the preferred channel
    let chan: Map<any, any> | undefined = channels.find(
        (channel: Map<any, any>) => {
            return (
                channel.get('type') === channelType &&
                (channel.get('preferred', false) as boolean)
            )
        },
    )

    // get the first channel available
    if (!chan) {
        chan = channels.find(
            (channel: Map<any, any>) => channel.get('type') === channelType,
        )
    }

    return chan || (fromJS({}) as Map<any, any>)
}

const LAST_SENDER_CHANNEL_KEY = 'lastSenderChannel'

export const persistLastSenderChannel = (channel: Map<any, any>) => {
    tryLocalStorage(() => {
        window.localStorage.setItem(
            LAST_SENDER_CHANNEL_KEY,
            JSON.stringify(channel.toJS()),
        )
    })
}

export const getLastSenderChannel = () => {
    if (window.localStorage) {
        const lastSenderChannel = window.localStorage.getItem(
            LAST_SENDER_CHANNEL_KEY,
        )
        if (lastSenderChannel) {
            try {
                return fromJS(JSON.parse(lastSenderChannel)) as Map<any, any>
            } catch (error) {
                console.error(
                    `Failed to decode window.localStorage."${LAST_SENDER_CHANNEL_KEY}"`,
                    error,
                )
            }
        }
    }
    return null
}

export function getOutboundCallFrom(
    ticket: Map<any, any>,
    channels: List<any>,
) {
    if (!channels.size) {
        return fromJS({
            id: null,
            name: '',
            address: '',
        }) as Map<any, any>
    }

    const voiceCalls = appQueryClient.getQueryData<UseListVoiceCalls>(
        voiceCallsKeys.list({ ticket_id: ticket.get('id') }),
    )?.data

    if (!voiceCalls?.length) {
        return channels.get(0) as Map<any, any>
    }

    const lastVoiceCallIntegrationId = voiceCalls[0].integration_id

    const channel = channels.find(
        (channel: Map<any, any>) =>
            channel.get('id') === lastVoiceCallIntegrationId,
    ) as Map<any, any> | undefined

    return channel || (channels.get(0) as Map<any, any>)
}

const getContactFormTicketMessageSender = (
    ticket: Map<any, any>,
): Map<any, any> | null => {
    const ticketMessages = ticket.get('messages') as List<any>
    const firstContactFormMessage = ticketMessages.find(
        (message: Map<any, any>) => {
            const isHelpCenterContactFormSource =
                message.getIn(['source', 'type']) ===
                TicketMessageSourceType.HelpCenterContactForm
            const isStandaloneContactFormSource =
                message.getIn(['source', 'type']) ===
                TicketMessageSourceType.ContactForm

            return (
                isHelpCenterContactFormSource || isStandaloneContactFormSource
            )
        },
    ) as Map<any, any> | undefined

    /**
     * Won't be used anymore
     */
    const isHelpCenterContactFormViaEmail =
        ticket.get('channel') === TicketChannel.HelpCenter &&
        ticket.get('via') === TicketChannel.ContactForm
    const isStandaloneContactFormViaEmail =
        ticket.get('channel') === TicketChannel.ContactForm &&
        ticket.get('via') === TicketChannel.ContactForm

    /**
     * Will be used after the migration of all help center contact forms
     */
    const isHelpCenterContactFormViaApi = firstContactFormMessage
        ? ticket.get('channel') === TicketChannel.HelpCenter &&
          ticket.get('via') === TicketChannel.Api &&
          firstContactFormMessage.getIn(['source', 'type']) ===
              TicketMessageSourceType.HelpCenterContactForm
        : false

    const isStandaloneContactFormViaApi = firstContactFormMessage
        ? ticket.get('channel') === TicketChannel.ContactForm &&
          ticket.get('via') === TicketChannel.Api &&
          firstContactFormMessage.getIn(['source', 'type']) ===
              TicketMessageSourceType.ContactForm
        : false

    if (
        [
            isHelpCenterContactFormViaEmail,
            isStandaloneContactFormViaEmail,
            isHelpCenterContactFormViaApi,
            isStandaloneContactFormViaApi,
        ].every((isContactForm) => !isContactForm)
    ) {
        // this is not a contact form ticket
        return null
    }

    if (!firstContactFormMessage) {
        // this is a contact form ticket but the contact form message is not available
        // this should not happen
        return null
    }

    return firstContactFormMessage.getIn(['source', 'to', 0]) as Map<any, any>
}

/**
 * Return sender based on ticket messages and available channels
 */
export function getNewMessageSender(
    ticket: Map<any, any>,
    newMessageSourceType: TicketMessageSourceType,
    channels: List<any>,
    integrations: Map<any, any>,
    defaultSettings?: AccountSettingDefaultIntegration | undefined,
) {
    if (newMessageSourceType === 'internal-note') {
        return fromJS(EMPTY_SENDER) as Map<any, any>
    }

    if (newMessageSourceType === TicketMessageSourceType.Phone) {
        return getOutboundCallFrom(ticket, channels)
    }

    // contact form cases
    const contactFormTicketMessageSender =
        getContactFormTicketMessageSender(ticket)
    if (contactFormTicketMessageSender) {
        // if found email sender is not available in the integrations
        // we don't return the sender email we found in the contact form ticket
        const integrationList = integrations.get('integrations') as
            | List<any>
            | undefined

        if (integrationList) {
            const foundIntegration = integrationList.find(
                (integration: Map<any, any>) =>
                    integration.getIn(['meta', 'address']) ===
                    contactFormTicketMessageSender.get('address'),
            ) as Map<any, any> | undefined

            if (foundIntegration) return contactFormTicketMessageSender
        }

        // we only select this sender if it's available in the integrations
    }

    const defaultIntegration =
        defaultSettings?.data?.[sourceTypeToChannel(newMessageSourceType)]

    const defaultChannel: Map<any, any> | undefined =
        defaultIntegration &&
        channels.find((c: Map<any, any>) => c.get('id') === defaultIntegration)
    const preferredChannel =
        defaultChannel ??
        getPreferredChannel(
            sourceTypeToChannel(newMessageSourceType),
            channels,
        ) ??
        fromJS({})

    const previousMessages = (ticket.get('messages') as List<any>).filter(
        (message: Map<any, any>) => {
            return !message.get('failed_datetime', null)
        },
    )

    const lastMessage: Map<any, any> | undefined = (
        previousMessages as List<any>
    ).findLast((message: Map<any, any>) => {
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
            TicketMessageSourceType.FacebookMentionComment
        ) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.FacebookMentionPost,
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
        } else if (
            newMessageSourceType === TicketMessageSourceType.TwitterTweet
        ) {
            return [
                TicketMessageSourceType.TwitterTweet,
                TicketMessageSourceType.TwitterQuotedTweet,
                TicketMessageSourceType.TwitterMentionTweet,
            ].includes(type)
        } else if (
            newMessageSourceType ===
            TicketMessageSourceType.YotpoReviewPublicComment
        ) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.YotpoReview,
            ].includes(type)
        } else if (
            newMessageSourceType ===
            TicketMessageSourceType.YotpoReviewPrivateComment
        ) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.YotpoReview,
            ].includes(type)
        } else if (newMessageSourceType === TicketMessageSourceType.Email) {
            return [
                newMessageSourceType,
                TicketMessageSourceType.Chat,
                TicketMessageSourceType.ChatContactForm,
                TicketMessageSourceType.ChatOfflineCapture,
            ].includes(type)
        }

        return type === newMessageSourceType
    })

    // messenger
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
        if (defaultChannel) {
            return defaultChannel
        }

        const lastSender = getLastSenderChannel()

        // make sure the persisted sender is in the list of channels
        if (
            lastSender &&
            channels.find(
                (c: Map<any, any>) =>
                    c.get('address') === lastSender.get('address'),
            )
        ) {
            return lastSender
        }
        return preferredChannel
    }

    // for chat integration, retrieve a preferred email if any
    if (
        [
            TicketMessageSourceType.Chat,
            TicketMessageSourceType.ChatContactForm,
            TicketMessageSourceType.ChatOfflineCapture,
        ].includes(lastMessage.getIn(['source', 'type']))
    ) {
        const integration =
            ((integrations.get('integrations') as List<any>).find(
                (integration: Map<any, any>) =>
                    integration.get('id') === lastMessage.get('integration_id'),
            ) as Map<any, any>) || fromJS({})

        const linkedEmailIntegration = integration.getIn([
            'meta',
            'preferences',
            'linked_email_integration',
        ])

        if (!linkedEmailIntegration) {
            return preferredChannel
        }

        return (
            (channels.find(
                (channel: Map<any, any>) =>
                    channel.get('id') === linkedEmailIntegration,
            ) as Map<any, any>) || preferredChannel
        )
    }

    // If the last message is an email and was sent from an agent, the sender of the
    // next should be the same as the previous one, unless an integration for it doesn't
    // exist anymore.
    if (
        lastMessage.get('from_agent', false) &&
        [
            TicketMessageSourceType.Email,
            TicketMessageSourceType.WhatsAppMessage,
            TicketMessageSourceType.Sms,
        ].includes(newMessageSourceType)
    ) {
        const address = lastMessage.getIn(['source', 'from', 'address']) as
            | string
            | undefined

        if (!address) {
            return preferredChannel
        }

        return (
            (channels as List<Map<any, any>>).find(
                (channel) => !!channel && channel.get('address') === address,
            ) || preferredChannel
        )
    }

    // If the last message was sent by a customer, the sender of the next one should be
    // in its recipients.
    const receivers = (
        lastMessage.getIn(['source', 'to'], fromJS([])) as List<any>
    ).concat(lastMessage.getIn(['source', 'cc'], fromJS([]))) as List<any>
    for (const channel of channels.toArray() as Map<any, any>[]) {
        for (const receiver of receivers.toArray() as Map<any, any>[]) {
            if (receiver.get('address') === channel.get('address')) {
                return channel
            }
        }

        // Unless one of the recipients was an alias for one of our integrations.
        if (lastMessage.get('integration_id') === channel.get('id')) {
            return channel
        }
    }

    return preferredChannel
}

/**
 * Return pending message index
 * match a newly posted message to a pending message and return its index
 */
export function getPendingMessageIndex(
    pendingMessages: TicketMessage[],
    message: TicketMessage,
) {
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
        'source.from',
        'source.to',
        'source.extra',
    ]

    pendingMessages.some((pending, i) => {
        if (_isEqual(_pick(pending, props), _pick(message, props))) {
            index = i
            return true
        }
    })

    return index
}

export const mergeTagActions = (
    oldAction: Map<any, any>,
    newAction: Map<any, any>,
) => {
    const oldTags = oldAction.getIn(['arguments', 'tags']) as string
    const newTags = newAction.getIn(['arguments', 'tags']) as string
    return Array.from(new Set((oldTags + ',' + newTags).split(','))).join(',')
}

export const mergeInternalNoteActions = (
    oldAction: Map<any, any>,
    newAction: Map<any, any>,
) => {
    let args = newAction.get('arguments') as Map<any, any>
    args = args.set(
        'body_text',
        (args.get('body_text') as string) +
            '\n' +
            (oldAction.getIn(['arguments', 'body_text']) as string),
    )
    return args.set(
        'body_html',
        (args.get('body_html') as string) +
            '<br/>' +
            (oldAction.getIn(['arguments', 'body_html']) as string),
    )
}

export const mergeActionsJS = (oldActions: any[], newActions: any[]): any => {
    return mergeActions(fromJS(oldActions), fromJS(newActions)).toJS()
}

export const mergeActions = (oldActions: List<any>, newActions: List<any>) => {
    let actions = newActions
    // If they are no actions with the same name in the new macro, we keep all the old ones
    // But they are some with the same name in the new macro, we discard the old ones
    oldActions.forEach((oldAction: Map<any, any>) => {
        const name = oldAction.get('name')
        const macroActionIndex = newActions.findIndex(
            (macroAction: Map<any, any>) => macroAction.get('name') === name,
        )
        if (macroActionIndex !== -1) {
            const newAction = actions.get(macroActionIndex)
            switch (name) {
                case MacroActionName.AddTags: {
                    actions = actions.setIn(
                        [macroActionIndex, 'arguments', 'tags'],
                        mergeTagActions(oldAction, newAction),
                    )
                    break
                }
                case MacroActionName.Http: {
                    const hookActions = actions.filter(
                        (action: Map<any, any>) => action.get('name') === name,
                    )

                    if (!hookActions.includes(oldAction))
                        actions = actions.push(oldAction)
                    break
                }
                case MacroActionName.AddInternalNote: {
                    actions = actions.setIn(
                        [macroActionIndex, 'arguments'],
                        mergeInternalNoteActions(oldAction, newAction),
                    )
                    break
                }
                // Keep only new action values
                default:
                    break
            }
        } else actions = actions.push(oldAction)
    })
    return actions
}

export function isReceiver(receiver: unknown): receiver is Receiver {
    return (
        typeof receiver === 'object' &&
        receiver !== null &&
        'name' in receiver &&
        (typeof (receiver as Receiver).name === 'string' ||
            (receiver as Receiver).name === null) &&
        'address' in receiver &&
        typeof (receiver as Receiver).address === 'string'
    )
}

export function humanizeCSATScore(score: number): string {
    return `${score} ★`
}

export function humanizeAddress(
    address: string,
    channel?: Maybe<ChannelLike>,
): string {
    if (
        channel &&
        isTicketMessageSourceType(channel) &&
        isPhoneBasedSource(channel)
    ) {
        return formatPhoneNumberInternational(address)
    }

    return address.toLowerCase()
}

export function humanizeChannel(channelName: ChannelIdentifier): string {
    const existing = TICKET_CHANNEL_NAMES[channelName]
    if (existing) {
        return existing
    }

    if (isTicketMessageSourceType(channelName)) {
        if (channelName === TicketMessageSourceType.InternalNote) {
            return humanize(channelName)
        }
        const channelFromSource = sourceTypeToChannel(channelName)
        switch (channelName) {
            case TicketMessageSourceType.EmailForward:
                return 'Forward'
            case TicketMessageSourceType.YotpoReviewPublicComment:
                return 'Public Yotpo reply'
            case TicketMessageSourceType.YotpoReviewPrivateComment:
                return 'Private Yotpo reply'
            default:
                return (
                    TICKET_CHANNEL_NAMES[channelFromSource] ??
                    humanize(channelFromSource)
                )
        }
    }

    const channel = toChannel(channelName)
    return channel ? channel.name : humanize(channelName)
}

export function buildFirstTicketMessage(
    ticketMessage: TicketMessage,
    messagePosition: number,
    ticketMeta: Map<any, any> | null,
): TicketMessage {
    if (messagePosition !== 0 || !ticketMeta) return ticketMessage

    const ticketMetaObj = ticketMeta.toJS()
    if (isGorgiasContactFormTicketMeta(ticketMetaObj)) {
        return {
            ...ticketMessage,
            meta: {
                ...ticketMessage.meta,
                current_page: ticketMetaObj.gorgias_contact_form.host_url,
            },
        }
    }

    return ticketMessage
}
