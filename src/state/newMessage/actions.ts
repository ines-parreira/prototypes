import {fromJS, List, Map} from 'immutable'
import {ContentState} from 'draft-js'
import {createAction} from '@reduxjs/toolkit'
import _isNull from 'lodash/isNull'
import _assign from 'lodash/assign'
import _pick from 'lodash/pick'
import _throttle from 'lodash/throttle'
import _omit from 'lodash/omit'
import axios, {AxiosError, CancelToken} from 'axios'

import * as ticketConstants from 'state/ticket/constants'
import {notify} from 'state/notifications/actions'
import * as ticketActions from 'state/ticket/actions'
import {Context, renderTemplate} from 'pages/common/utils/template'
import {getActionTemplate, toJS, uploadFiles} from 'utils'
import {ActionTemplateExecution} from 'config'
import {Macro} from 'models/macro/types'

import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    getNewMessageSender,
    getLastSameSourceTypeMessage,
    getSourceTypeOfResponse,
    persistLastSenderChannel,
} from 'state/ticket/utils'
import * as integrationSelectors from 'state/integrations/selectors'
import * as ticketSelectors from 'state/ticket/selectors'
import * as agentSelectors from 'state/agents/selectors'
import socketManager from 'services/socketManager/socketManager'
import {Attachment} from 'types'
import type {CurrentUser, RootState, StoreDispatch} from 'state/types'
import {getMomentNow} from 'utils/date'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import {IntegrationType, ProductCardDetails} from 'models/integration/types'
import client from 'models/api/resources'
import {Ticket as TicketResponse} from 'models/ticket/types'
import {Customer} from 'state/customers/types'
import {NotificationStatus} from 'state/notifications/types'
import {SocketEventType} from 'services/socketManager/types'
import history from 'pages/history'
import {ShopifyProductCardContentType} from 'constants/integrations/shopify'
import {SearchType, UserSearchResult} from 'models/search/types'
import {search} from 'models/search/resources'
import {CustomerChannel} from 'models/customerChannel/types'

import {EMPTY_SENDER} from 'state/ticket/constants'
import {MacroActionName} from 'models/macroAction/types'
import * as responseUtils from './responseUtils'
import * as selectors from './selectors'
import * as constants from './constants'
import {
    MacroActions,
    Message,
    NewMessage,
    ReplyAreaState,
    Ticket,
} from './types'
import {
    addEmailExtraContent,
    deleteEmailExtraContent,
    EmailExtraArgs,
    getReplyThreadMessages,
    hasOnlySignatureText,
} from './emailExtraUtils'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from './errors'

export const addAttachments =
    (ticket: Map<any, any>, atts: FileList | Attachment[] | File[]) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> | ReturnType<StoreDispatch> => {
        dispatch({
            type: constants.NEW_MESSAGE_ADD_ATTACHMENT_START,
        })

        const {newMessage} = getState()

        let attachments = atts
        const newMessageSourceType = newMessage.getIn([
            'newMessage',
            'source',
            'type',
        ])
        const isFacebookComment =
            newMessageSourceType === TicketMessageSourceType.FacebookComment
        const isFacebookReviewComment =
            newMessageSourceType ===
            TicketMessageSourceType.FacebookReviewComment

        if (isFacebookComment || isFacebookReviewComment) {
            // We have specific constraints on attachments.

            const attachmentsFiltered: FileList | Attachment[] = Object.values(
                atts
            ).filter((att: File | Attachment) => {
                const type = att.type || (att as Attachment).content_type
                return type.startsWith('image') || type.startsWith('video')
            })

            const previousAtts: List<any> =
                newMessage.getIn(['newMessage', 'attachments']) || fromJS([])

            if (
                previousAtts.size > 0 ||
                atts.length > 1 ||
                atts.length !== attachmentsFiltered.length
            ) {
                void dispatch(
                    notify({
                        id: 'newMessageAddAttachmentsError',
                        dismissAfter: 0,
                        status: NotificationStatus.Error,
                        title: 'We could not add all of your attachments !',
                        allowHTML: true,
                        message: `
                    Facebook comments have limitations on attachments:
                    <ul>
                        <li>You cannot send more than one attachment.</li>
                        <li>You can only send images or videos.</li>
                    </ul>
                `,
                    })
                )
                return dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                })
            }

            attachments =
                previousAtts.size > 0 ? [] : attachmentsFiltered.slice(0, 1)
        }

        return uploadFiles(attachments).then(
            (resp: Attachment[]) => {
                const state = getState()
                const {ticket: _ticket} = state

                if (ticket.get('id') !== _ticket.get('id')) {
                    return Promise.resolve()
                }

                dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                if (error.response?.status === 413) {
                    return dispatch({
                        type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                        error,
                        reason: 'Failed to upload files. One or more files are larger than the size limit of 10MB.',
                    })
                }

                return dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                    error,
                    reason: 'Failed to upload files. Please try again later',
                })
            }
        )
    }

export const addProductCardAttachments =
    (ticket: Map<any, any>, productCardDetails: ProductCardDetails) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> | ReturnType<StoreDispatch> => {
        const state = getState()
        const {ticket: _ticket} = state

        if (ticket.get('id') !== _ticket.get('id')) {
            return Promise.resolve()
        }

        const resp = [
            {
                content_type: 'application/productCard',
                name: productCardDetails.productTitle,
                size: 0,
                url: productCardDetails.imageUrl,
                extra: {
                    price: productCardDetails.price,
                    variant_name: productCardDetails.variantTitle,
                    product_link: productCardDetails.link,
                    currency: productCardDetails.currency,
                },
            },
        ]

        dispatch({
            type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
            resp,
        })
    }

export const deleteAttachment = (index: number) => ({
    type: constants.NEW_MESSAGE_DELETE_ATTACHMENT,
    index,
})

const _throttledIsTyping = _throttle(
    (ticketId: string) => {
        socketManager.send(SocketEventType.AgentTypingStarted, ticketId)
    },
    5000,
    {trailing: false}
) // we don't want to throw event after the ticket has been left

export const setResponseText =
    (args: Map<any, any> = fromJS({})) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const {ticket, currentUser, newMessage} = state
        const contentState = args.get('contentState') as ContentState
        const ticketId = ticket.get('id') as string
        const signature = selectors.getNewMessageSignature(state)

        if (contentState && newMessage && ticketId) {
            const plainText = contentState.getPlainText()

            const shouldSendTypingEvent =
                plainText &&
                !hasOnlySignatureText(contentState, signature) &&
                newMessage.getIn(['newMessage', 'source', 'type']) !==
                    TicketMessageSourceType.InternalNote

            if (shouldSendTypingEvent) {
                _throttledIsTyping(ticketId)
            } else if (agentSelectors.isAgentTypingOnTicket(ticketId)(state)) {
                _throttledIsTyping.cancel()
                socketManager.send(SocketEventType.AgentTypingStopped, ticketId)
            }
        }

        const topRankMacroState = ticketSelectors.getTopRankMacroState(state)
        // should have the same params in state/ticket/actions/applyMacroAction
        return dispatch({
            type: constants.SET_RESPONSE_TEXT,
            args,
            ticketId,
            forceFocus: args.get('forceFocus', false),
            forceUpdate: args.get('forceUpdate', false),
            ticket, // used in middleware, not in reducer
            appliedMacro: ticket.getIn(['state', 'appliedMacro']),
            currentUser, // used in middleware, not in reducer
            signature,
            fromMacro: false, // used in middleware, not in reducer
            topRankMacroState,
        })
    }

export const addEmailExtra = createAction<{
    contentState: ContentState
    emailExtraArgs: EmailExtraArgs
}>(constants.NEW_MESSAGE_ADD_EMAIL_EXTRA)

/**
 * Set new message receivers
 */
export const setReceivers = (
    receivers: Record<string, unknown> = {},
    replaceAll = true
) => ({
    type: constants.NEW_MESSAGE_SET_RECEIVERS,
    receivers,
    replaceAll,
})

export const setActiveCustomerAsReceiver =
    () => (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const ticket = state.ticket
        const newMessageSource = selectors.getNewMessageSource(state)
        const customerChannels: CustomerChannel[] =
            (
                ticket.getIn(['customer', 'channels']) as List<CustomerChannel>
            )?.toJS() || []
        const sourceType: TicketChannel =
            newMessageSource.get('type') ?? TicketChannel.Email
        const sourceTypeToSearch =
            sourceType === TicketChannel.Sms ? TicketChannel.Phone : sourceType
        const customerChannel = customerChannels.find(
            (channel: CustomerChannel) => channel.type === sourceTypeToSearch
        )
        const address = customerChannel
            ? customerChannel.address
            : ticket.getIn(['customer', 'email'])
        const name = ticket.getIn(['customer', 'name'])

        if (address && name) {
            dispatch(setReceivers({to: [{name, address}]}, false))
        }
    }

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 */
export const setSender =
    (sender?: Maybe<string>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const {integrations, ticket} = state
        const sourceType = selectors.getNewMessageType(state)
        const {
            getPhoneChannelsForPhoneSource,
            getPhoneChannelsForSmsSource,
            getEmailChannels,
        } = integrationSelectors
        const emailChannels = getEmailChannels(state)
        const phoneChannels =
            sourceType === TicketMessageSourceType.Sms
                ? getPhoneChannelsForSmsSource(state)
                : getPhoneChannelsForPhoneSource(state)
        const channels =
            sourceType === TicketMessageSourceType.Phone ||
            sourceType === TicketMessageSourceType.Sms
                ? phoneChannels
                : emailChannels
        let _sender: Map<any, any> = fromJS({})
        if (sender) {
            _sender =
                channels.find(
                    (channel: Map<any, any>) =>
                        channel.get('address') === sender
                ) || fromJS({})
        }

        if (_sender.isEmpty()) {
            _sender =
                getNewMessageSender(
                    ticket,
                    sourceType,
                    channels,
                    integrations
                ) || fromJS({})
        }

        if (
            !_sender.isEmpty() &&
            _sender.get('type') === 'email' &&
            !_sender.get('verified')
        ) {
            if (
                !(_sender.get('address') as string).endsWith(
                    window.EMAIL_FORWARDING_DOMAIN
                )
            ) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: `You cannot send messages using ${
                            _sender.get('address') as string
                        }, because this address is not verified yet.`,
                    })
                )
            }
            _sender =
                channels.find(
                    (channel: Map<any, any>) =>
                        channel.get('verified') === true &&
                        [
                            IntegrationType.Email,
                            IntegrationType.Gmail,
                            IntegrationType.Outlook,
                        ].includes(channel.get('type'))
                ) || fromJS({})
        }

        if (!_sender.isEmpty()) {
            const id = _sender.get('id')

            _sender = fromJS({
                name: _sender.get('name', ''),
                address: _sender.get('address', ''),
            })

            if (sourceType === TicketMessageSourceType.Phone) {
                _sender = _sender.set('id', id)
            }

            // persist `_sender` only if it's explicitly set on the function call (i.e: when user selects value from dropdown)
            if (sender) {
                persistLastSenderChannel(_sender)
            }
        }

        return dispatch({
            type: constants.NEW_MESSAGE_SET_SENDER,
            sender: _sender,
        })
    }

export const setSourceType =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch({
            type: constants.NEW_MESSAGE_SET_SOURCE_TYPE,
            sourceType,
            messages: getState().ticket.get('messages'),
        })
    }

export const setSubject = (subject = '') => ({
    type: constants.NEW_MESSAGE_SET_SUBJECT,
    subject,
})

export const setSourceExtra = (extra: Record<string, unknown>) => ({
    type: constants.NEW_MESSAGE_SET_SOURCE_EXTRA,
    extra,
})

/**
 * Prepare default message
 */
const prepareDefault =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch(setSubject())
        dispatch(setSourceType(sourceType))
        dispatch(setSourceExtra({}))
        resetReceiversAndSender(dispatch, getState)
    }

/**
 * Prepare the new message based on its source type
 */
export const prepare =
    (sourceType: TicketMessageSourceType) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()
        const currentTicket = ticketSelectors.DEPRECATED_getTicket(state)
        // cache source type when changed
        responseUtils.setSourceTypeCache(currentTicket.get('id'), sourceType)

        //Clean up productCard attachments for unsupported channels
        if (
            sourceType !== TicketMessageSourceType.Chat &&
            sourceType !== TicketMessageSourceType.InternalNote
        ) {
            const currentAttachments = selectors.getNewMessageAttachments(state)
            const currentAttachmentsArray =
                currentAttachments.toArray() as Array<Map<any, any>>
            for (
                let index = currentAttachmentsArray.length - 1;
                index >= 0;
                index--
            ) {
                if (
                    currentAttachmentsArray[index].get('content_type') ===
                    ShopifyProductCardContentType
                )
                    dispatch(deleteAttachment(index))
            }
        }

        switch (sourceType) {
            case TicketMessageSourceType.EmailForward: {
                //$TsFixMe remove casting once ticket selectors are migrated
                const messages = (
                    ticketSelectors.getMessages as (
                        state: RootState
                    ) => List<any>
                )(state)
                let attachments: FileList | Attachment[] = []
                messages.forEach((message: Map<any, any>) => {
                    attachments = (attachments as Array<Attachment>).concat(
                        toJS<Attachment[]>(
                            (message.get('attachments') ||
                                fromJS([])) as List<any>
                        )
                    )
                })

                const currentAttachments =
                    selectors.getNewMessageAttachments(state)
                const currentAttachmentsUrls = currentAttachments.map(
                    (attachment: Map<any, any>) =>
                        attachment.get('url') as string
                ) as List<any>

                // Filter out all attachments already present in the state, to avoid setting them again when changing
                // the source type to `email-forward` multiple times, also remove productCard attachments
                attachments = attachments.filter(
                    (attachment) =>
                        !currentAttachmentsUrls.includes(attachment.url) &&
                        attachment.content_type !==
                            ShopifyProductCardContentType
                )

                dispatch(
                    setSubject(
                        `Fwd: ${currentTicket.get('subject', '') as string}`
                    )
                )
                dispatch(setSourceType(TicketMessageSourceType.Email))
                dispatch(setSourceExtra({forward: true}))
                dispatch(setSender())
                dispatch(setReceivers())
                dispatch({
                    type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                    resp: attachments,
                })
                break
            }
            case TicketMessageSourceType.InternalNote: {
                const contentState = selectors.getNewMessageContentState(state)
                const userInputContentState =
                    deleteEmailExtraContent(contentState)

                let responseTextArgs = fromJS({
                    contentState: userInputContentState,
                    forceFocus: true,
                    forceUpdate: true,
                }) as Map<string, unknown>

                if (contentState !== userInputContentState) {
                    responseTextArgs = responseTextArgs.set(
                        'emailExtraAdded',
                        false
                    )
                }
                dispatch(setResponseText(responseTextArgs))
                dispatch(prepareDefault(sourceType))

                break
            }
            case TicketMessageSourceType.InstagramComment:
            case TicketMessageSourceType.InstagramAdComment:
            case TicketMessageSourceType.InstagramMentionComment: {
                // If we're preparing a new Instagram comment message, we want to insert a mention of format `@username `
                // with the user name of the customer
                dispatch(prepareDefault(sourceType))
                const newState = getState()
                const newMessageState = selectors.getNewMessageState(newState)
                const receiverName = newMessageState.getIn(
                    ['newMessage', 'source', 'to', 0, 'name'],
                    ''
                ) as string
                const contentState = newMessageState.getIn([
                    'state',
                    'contentState',
                ]) as ContentState

                // If there's already text in the contentState, or there's no receiver's name, we don't want to add the
                // mention
                if ((contentState && contentState.hasText()) || !receiverName) {
                    return
                }

                const newContentState = ContentState.createFromText(
                    `@${receiverName} `
                )
                const newSelectionState = responseUtils.selectionAfter(
                    newContentState.getBlocksAsArray() as any
                )

                dispatch(
                    setResponseText(
                        fromJS({
                            contentState: newContentState,
                            selectionState: newSelectionState,
                            dirty: true,
                            forceFocus: true,
                            forceUpdate: true,
                        })
                    )
                )
                break
            }
            default: {
                dispatch(prepareDefault(sourceType))
                break
            }
        }
    }

/**
 * Only getting potential customers and calling a callback
 * No reducer action after that
 */
export const updatePotentialCustomers =
    (
        query: string,
        type: SearchType = SearchType.UserChannelEmail,
        cancelToken?: CancelToken
    ) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> =>
        search<UserSearchResult>({
            type,
            query,
            cancelToken,
        }).then(
            (resp) => {
                return {
                    ...resp,
                    data: resp.data.map((result) => {
                        return {
                            ...result,
                            ...result.user,
                        }
                    }),
                }
            },
            (error: AxiosError) => {
                if (axios.isCancel(error)) {
                    return Promise.resolve() as unknown
                }
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to do the search. Please try again...',
                })
            }
        )

export const initializeMessageDraft = () => (dispatch: StoreDispatch) => {
    // get cached macro
    dispatch(ticketActions.fetchTicketReplyMacro())
    // get cached ticket reply message
    dispatch(setResponseText())
}

/**
 * Perform various actions on the ticket data and return a POST-able ticket data structure.
 * Adds the newMessage to the ticket's messages, attaches actions and sets some source elements on the message.
 * Also sets some properties on the ticket.
 */
export function prepareTicketDataToSend(
    dispatch: StoreDispatch,
    getState: () => RootState,
    ticketState: Map<any, any>,
    newMessageState: Map<any, any>,
    status: Maybe<string>,
    actionsForMacro: Maybe<MacroActions>,
    currentUser: CurrentUser
): Maybe<{
    ticket: Omit<Ticket, 'state' | '_internal' | 'newMessage'>
    newMessage: NewMessage
    replyAreaState: ReplyAreaState
}> {
    const ticket = toJS<Ticket>(ticketState)
    const replyAreaState = responseUtils.toReplyAreaState(
        newMessageState.get('state') as Map<any, any>
    )
    ticket.newMessage = (
        newMessageState.get('newMessage') as Map<any, any>
    )?.toJS()
    ticket.status = status || ticket.status

    if (ticket.assignee_user) {
        ticket.assignee_user = {id: ticket.assignee_user.id}
    }

    // Prepare newMessage to send it.
    if (ticket.newMessage) {
        const state = getState()
        let actions = actionsForMacro

        //Transform empty message with macro to internal note
        if (!selectors.hasContent(state) && !!ticket.state?.appliedMacro) {
            ticket.newMessage.source = {
                ...ticket.newMessage.source,
                type: TicketMessageSourceType.InternalNote,
                from: EMPTY_SENDER,
            }
            delete ticket.newMessage.source.to
            const internalNote = actions?.find(
                (action) =>
                    action!.get('name') === MacroActionName.AddInternalNote
            )
            if (internalNote) {
                ticket.newMessage.body_text = internalNote.getIn(
                    ['arguments', 'body_text'],
                    ''
                )
                ticket.newMessage.body_html = internalNote.getIn(
                    ['arguments', 'body_html'],
                    ''
                )
                actions = actions?.filter(
                    (action) =>
                        action!.get('name') !== MacroActionName.AddInternalNote
                ) as Maybe<MacroActions>
            } else {
                const text = `Applied macro "${
                    (ticket.state.appliedMacro as Macro).name
                }"`
                ticket.newMessage.body_text = text
                ticket.newMessage.body_html = `<div>${text}</div>`
            }

            ticket.newMessage.public = false
        }

        const sourceType = ticket.newMessage.source.type
        const {emailExtraAdded, contentState} = replyAreaState

        const isFacebookComment =
            ticket.newMessage.channel === TicketMessageSourceType.Facebook &&
            ticket.newMessage.source.type ===
                TicketMessageSourceType.FacebookComment

        const isFacebookReviewComment =
            ticket.newMessage.channel ===
                TicketMessageSourceType.FacebookRecommendations &&
            ticket.newMessage.source.type ===
                TicketMessageSourceType.FacebookReviewComment

        if (sourceType === TicketMessageSourceType.Email && !emailExtraAdded) {
            const newContentState = addEmailExtraContent(contentState, {
                signature: selectors.getNewMessageSignature(state),
                replyThreadMessages: getReplyThreadMessages(
                    ticketSelectors.getBody(state).toJS()
                ),
                ticket: ticketState.toJS(),
                isForwarded: selectors.isForward(state),
            })

            ticket.newMessage = responseUtils.updateNewMessageWithContentState(
                ticket.newMessage,
                newContentState
            )
            replyAreaState.emailExtraAdded = true
            replyAreaState.contentState = newContentState
        }

        const lastSameTypeMessage = getLastSameSourceTypeMessage(
            ticketState.get('messages'),
            sourceType
        )

        if (ticket.messages.length && lastSameTypeMessage) {
            const lastMessage = lastSameTypeMessage.toJS() as NewMessage

            if (lastMessage.source.extra) {
                ticket.newMessage.source.extra = _assign(
                    {},
                    ticket.newMessage.source.extra,
                    lastMessage.source.extra
                )
            }
        }

        // i.e. if we're creating a new ticket
        if (!ticket.messages.length) {
            ticket.channel = ticket.newMessage.channel
        }

        if (!ticket.newMessage.sender) {
            ticket.newMessage.sender = fromJS(
                _pick(currentUser.toJS(), ['email', 'id', 'name'])
            )
        }

        // Facebook does not accept comment with just an attachment.
        if (isFacebookComment || isFacebookReviewComment) {
            if (
                ticket.newMessage.body_text.length === 0 &&
                ticket.newMessage.attachments.length > 0
            ) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        title: 'Your message cannot be sent',
                        message:
                            'You cannot send an attachment without a message in a Facebook comment.',
                    })
                )
                return null
            }
        }

        if (actions) {
            ticket.newMessage.actions = actions.map(
                (curAction: Map<any, any> = fromJS({})) =>
                    formatAction(
                        curAction,
                        fromJS(getActionTemplate(curAction.get('name'))),
                        {
                            ticket: ticketState.toJS(),
                            currentUser: currentUser.toJS(),
                        }
                    )
            ) as List<Map<any, any>>
        }
    }

    const newMessageData = ticket.newMessage

    return {
        replyAreaState,
        ticket: _omit(ticket, ['state', '_internal', 'newMessage']),
        newMessage: newMessageData,
    }
}

export const formatAction = (
    action: Map<any, any>,
    template: Map<any, any>,
    context: Context
) => {
    /**
     * Verify if any argument of the action is a `listDict`, i.e. a data structure as such :
     *
     * [
     *   {
     *     key: k1,
     *     value: v1,
     *     ... // anything else
     *   },
     *   {
     *     key: k2,
     *     value: v2,
     *     ...
     *   },
     *   ...
     * ]
     *
     * which must be transformed into a dict before sending to the server (the other fields being
     * useful for the UI only).
     *
     * {
     *   k1: v1,
     *   k2: v2,
     *   ...
     * }
     *
     */

    let newArgs: Map<any, any> = fromJS({})
    const actionArguments = action.get('arguments') as List<any>

    actionArguments.forEach((value, key) => {
        if (template.getIn(['arguments', key, 'type']) === 'listDict') {
            newArgs = newArgs.set(key, fromJS({}))
            ;(value as List<any>).forEach((element: Map<any, any>) => {
                if (element.get('value') !== '') {
                    newArgs = newArgs.setIn(
                        [key, renderTemplate(element.get('key'), context)],
                        renderTemplate(element.get('value'), context)
                    )
                }
            })
        } else {
            newArgs = newArgs.set(key, value)
        }
    })

    return action
        .set('arguments', newArgs)
        .set(
            'status',
            template.get('execution') !== ActionTemplateExecution.Front
                ? 'pending'
                : 'success'
        )
}

/**
 * Perform actions when we successfully create a new message.
 */
function onMessageSent(dispatch: StoreDispatch) {
    // reinitialize the current macro
    dispatch({
        type: ticketConstants.APPLY_MACRO,
        macro: undefined,
    })
}

export function prepareTicketMessage(
    status: Maybe<string>,
    macroActions: Maybe<MacroActions>,
    resetMessage = true,
    retryMessage?: Map<any, any>
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<{
        messageId: number
        messageToSend: NewMessage
        replyAreaState: ReplyAreaState
    }> =>
        new Promise((resolve, reject) => {
            const {ticket, currentUser, newMessage} = getState()
            // temporary message id
            let messageId = getMomentNow()
            let messageToSend: NewMessage
            let replyAreaState = responseUtils.toReplyAreaState(
                newMessage.get('state')
            )

            // message already parsed
            if (!!retryMessage) {
                messageId = retryMessage.getIn(['_internal', 'id'])
                messageToSend = retryMessage.get('originalMessage')
            } else {
                const dataToSend = prepareTicketDataToSend(
                    dispatch,
                    getState,
                    ticket,
                    newMessage,
                    status,
                    macroActions,
                    currentUser
                )

                if (!dataToSend || _isNull(dataToSend)) {
                    dispatch({
                        type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                        reason: 'Message was not sent. Sent data is invalid.',
                        messageId,
                    })
                    return reject(new TicketMessageInvalidSendDataError())
                }

                messageToSend = dataToSend.newMessage
                replyAreaState = dataToSend.replyAreaState
            }

            // Execute front-end validations for each action of the message
            if (messageToSend.actions) {
                for (const messageAction of messageToSend.actions as unknown as Map<
                    any,
                    any
                >[]) {
                    const template = getActionTemplate(
                        (fromJS(messageAction) as Map<any, any>).get('name')
                    )

                    // We can't just have a fallback in the get, in case ticket.customer.data === null
                    const customer: Record<string, unknown> = (
                        (ticket.getIn(['customer']) || fromJS({})) as Map<
                            any,
                            any
                        >
                    ).toJS()
                    if (template && template.validators) {
                        for (const validator of template.validators) {
                            const res = validator.validate(
                                customer as unknown as Customer
                            )

                            if (!res) {
                                dispatch({
                                    type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                                    error: 'Action validation error.',
                                    reason: validator.error,
                                    message: messageToSend,
                                    messageId,
                                })
                                return reject(
                                    new TicketMessageActionValidationError(
                                        validator.error
                                    )
                                )
                            }
                        }
                    }
                }
            }

            const state = getState()

            dispatch({
                type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                message: messageToSend,
                messageId,
                resetMessage,
                retry: !!retryMessage,
                status: status,
                //$TsFixMe remove casting once ticket selectors are migrated
                messages: (
                    ticketSelectors.getMessages as (
                        state: RootState
                    ) => List<any>
                )(state),
                ticketId: ticket.get('id'),
                ticketVia: ticket.get('via'),
            })

            onMessageSent(dispatch)

            // clear the message (since it was just sent) but force the focus on the field
            dispatch(
                setResponseText(fromJS({forceFocus: true, forceUpdate: true}))
            )
            dispatch(resetReceiversAndSender)
            resolve({
                messageId,
                messageToSend,
                replyAreaState,
            })

            dispatch({
                type: ticketConstants.SET_TOP_RANK_MACRO_STATE,
                ticketId: ticket.get('id'),
                topRankMacroState: null,
            })
        })
}

export function sendTicketMessage(
    messageId: number,
    messageToSend: NewMessage,
    action: Maybe<string>,
    resetMessage = true,
    ticketId?: Maybe<string>
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<Message> =>
        new Promise((resolve) => {
            const {ticket} = getState()
            let promise

            if (action) {
                promise = client.put<Message>(
                    `/api/tickets/${
                        ticketId || (ticket.get('id') as number)
                    }/messages/${messageToSend.id || ''}/${
                        action ? `?action=${action}` : ''
                    }`,
                    messageToSend
                )
            } else {
                promise = client.post<Message>(
                    `/api/tickets/${
                        ticketId || (ticket.get('id') as number)
                    }/messages/`,
                    messageToSend
                )
            }
            void promise
                .then((json) => json?.data)
                .then(
                    (resp) => {
                        const state = getState()
                        const {ticket: _ticket} = state

                        // if we changed the displayed ticket (e.g. submit and close), we don't want to change the state.
                        if (
                            !(
                                resp.ticket_id !== _ticket.get('id') &&
                                _ticket.get('id')
                            )
                        ) {
                            //$TsFixMe remove casting once ticket selectors are migrated
                            const messages = (
                                ticketSelectors.getMessages as (
                                    state: RootState
                                ) => List<any>
                            )(state)
                            const via = ticketSelectors.getVia(state)

                            dispatch({
                                type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                                resetMessage,
                                resp,
                                messages,
                                messageId,
                            })
                            const sourceTypeOfResponse =
                                getSourceTypeOfResponse(
                                    messages.push(resp),
                                    via
                                )
                            if (
                                [
                                    TicketMessageSourceType.InstagramComment,
                                    TicketMessageSourceType.InstagramAdComment,
                                    TicketMessageSourceType.InstagramMentionComment,
                                    TicketMessageSourceType.Sms,
                                ].includes(sourceTypeOfResponse)
                            ) {
                                dispatch(prepare(sourceTypeOfResponse))
                            }
                        }

                        return Promise.resolve(resp)
                    },
                    (error: AxiosError) => {
                        return dispatch({
                            type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                            error,
                            verbose: true,
                            reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.',
                            message: messageToSend,
                            messageId,
                        })
                    }
                )
                .then(resolve as any)
        })
}

export function retrySubmitTicketMessage(message: Map<any, any>) {
    return (dispatch: StoreDispatch) => {
        return dispatch(
            prepareTicketMessage(
                message.getIn(['_internal', 'status']),
                null,
                false,
                message
            )
        ).then(({messageId, messageToSend}) => {
            return dispatch(
                sendTicketMessage(messageId, messageToSend, null, false)
            )
        })
    }
}

export function submitTicket(
    ticket: Map<any, any>,
    status: Maybe<string>,
    macroActions: Maybe<MacroActions>,
    currentUser: CurrentUser,
    resetMessage = true
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Maybe<Promise<ReturnType<StoreDispatch>>> => {
        const {newMessage} = getState()

        dispatch({
            type: constants.NEW_MESSAGE_SUBMIT_TICKET_START,
        })

        const dataToSend = prepareTicketDataToSend(
            dispatch,
            getState,
            ticket,
            newMessage,
            status,
            macroActions,
            currentUser
        )

        // in case of,
        // error is dispatched by prepareTicketDataToSend
        if (!dataToSend) {
            return null
        }

        const ticketToSend = dataToSend.ticket
        ticketToSend.messages.push(dataToSend.newMessage)

        return client
            .post<TicketResponse>('/api/tickets/', ticketToSend)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    onMessageSent(dispatch)

                    history.push(`/app/ticket/${resp.id}`)

                    const state = getState()
                    const {ticket} = state

                    if (resp.id !== ticket.get('id') && ticket.get('id')) {
                        return Promise.resolve({resp})
                    }

                    // dispatch for ticket reducer branch
                    dispatch({
                        type: ticketConstants.SUBMIT_TICKET_SUCCESS,
                        resp,
                    })

                    // dispatch for newMessage reducer branch
                    dispatch({
                        type: constants.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                        resetMessage,
                        resp,
                    })

                    dispatch(resetReceiversAndSender)

                    return Promise.resolve(resp) as unknown as Promise<
                        ReturnType<StoreDispatch>
                    >
                },
                (error) => {
                    return dispatch({
                        type: constants.NEW_MESSAGE_SUBMIT_TICKET_ERROR,
                        error,
                        verbose: true,
                        reason: 'Ticket was not created. Please try again in a few moments. If the problem persists contact us',
                    })
                }
            )
    }
}

export function resetFromTicket(ticket: Map<any, any>) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        dispatch({
            type: constants.NEW_MESSAGE_RESET_FROM_TICKET,
            ticket,
        })
        return dispatch(resetReceiversAndSender)
    }
}

export function resetReceiversAndSender(
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> {
    const state = getState()
    const {ticket} = state
    const type = selectors.getNewMessageType(state)
    // set receivers according to last sent message
    const receivers = guessReceiversFromTicket(
        ticket,
        type,
        integrationSelectors.getChannelsByType(type)(state)
    )
    const receiversValues = receiversValueFromState(receivers, type)
    dispatch(setReceivers(receiversStateFromValue(receiversValues, type)))
    // set sender according to last sent message
    return dispatch(setSender())
}

export const newMessageResetFromMessage = createAction<{
    newMessage: NewMessage
    replyAreaState: ReplyAreaState
}>(constants.NEW_MESSAGE_RESET_FROM_MESSAGE)

export const newMessageQuickResponseFlow = createAction<{
    attachments: List<any>
}>(constants.NEW_MESSAGE_QUICK_RESPONSE_FLOW)

export const setShowConvertToForwardPopover = createAction<boolean>(
    constants.NEW_MESSAGE_SHOW_CONVERT_TO_FORWARD_POPOVER
)
