import {browserHistory} from 'react-router'
import {fromJS, Map, List} from 'immutable'
import {ContentState} from 'draft-js'
import {createAction} from '@reduxjs/toolkit'
import _isNull from 'lodash/isNull'
import _assign from 'lodash/assign'
import _pick from 'lodash/pick'
import _throttle from 'lodash/throttle'
import axios, {CancelToken, AxiosError} from 'axios'

import * as ticketConstants from '../ticket/constants'
import {notify} from '../notifications/actions'
import * as ticketActions from '../ticket/actions'
import {renderTemplate} from '../../pages/common/utils/template.js'
import {getActionTemplate, uploadFiles, toJS} from '../../utils.js'
import {convertToHTML} from '../../utils/editor.js'
import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    getNewMessageSender,
    getLastSameSourceTypeMessage,
    getSourceTypeOfResponse,
    persistLastSenderChannel,
} from '../ticket/utils.js'
import * as integrationSelectors from '../integrations/selectors'
import * as ticketSelectors from '../ticket/selectors'
import * as agentSelectors from '../agents/selectors'
import {
    AGENT_TYPING_STARTED,
    AGENT_TYPING_STOPPED,
} from '../../config/socketConstants.js'
import socketManager from '../../services/socketManager/socketManager.js'
import {Attachment, ActionTemplate} from '../../types'
import type {StoreDispatch, RootState, CurrentUser} from '../types'
import {getMomentNow} from '../../utils/date.js'
import {TicketMessageSourceType} from '../../business/types/ticket'
import {IntegrationType} from '../../models/integration/types'
import {ApiListResponse} from '../../models/api/types'
import {Ticket as TicketResponse} from '../../models/ticket/types'
import {NotificationStatus} from '../notifications/types'

import * as responseUtils from './responseUtils'
import * as selectors from './selectors'
import * as constants from './constants'
import {
    MacroActions,
    NewMessage,
    Ticket,
    UserSearchResult,
    Message,
} from './types'

export const addAttachments = (
    ticket: Map<any, any>,
    atts: FileList | Attachment[]
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> | ReturnType<StoreDispatch> => {
    dispatch({
        type: constants.NEW_MESSAGE_ADD_ATTACHMENT_START,
    })
    const {newMessage} = getState()

    let attachments = atts

    if (
        newMessage.getIn(['newMessage', 'source', 'type']) ===
        TicketMessageSourceType.FacebookComment
    ) {
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
                    reason:
                        'Failed to upload files. One or more files are larger than the size limit of 10MB.',
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

export const deleteAttachment = (index: number) => ({
    type: constants.NEW_MESSAGE_DELETE_ATTACHMENT,
    index,
})

const _throttledIsTyping = _throttle(
    (ticketId: string) => {
        socketManager.send(AGENT_TYPING_STARTED, ticketId)
    },
    5000,
    {trailing: false}
) // we don't want to throw event after the ticket has been left

export const setResponseText = (args: Map<any, any> = fromJS({})) => (
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
            !responseUtils.hasOnlySignature(
                contentState,
                signature.get('text')
            ) &&
            newMessage.getIn(['newMessage', 'source', 'type']) !==
                TicketMessageSourceType.InternalNote

        if (shouldSendTypingEvent) {
            _throttledIsTyping(ticketId)
        } else if (agentSelectors.isAgentTypingOnTicket(ticketId)(state)) {
            _throttledIsTyping.cancel()
            socketManager.send(AGENT_TYPING_STOPPED, ticketId)
        }
    }

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
    })
}

/**
 * Add a signature (if any) at the end of the content state
 */
export const addSignature = (
    contentState: ContentState,
    signature: Map<any, any>
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    const {newMessage} = getState()

    if (
        newMessage.getIn(['newMessage', 'source', 'type']) !== 'email' ||
        newMessage.getIn(['newMessage', 'state', 'signatureAdded'], false) ===
            true ||
        responseUtils.isSignatureAdded(contentState, signature.get('text'))
    ) {
        return
    }

    return dispatch({
        type: constants.NEW_MESSAGE_ADD_SIGNATURE,
        contentState,
        signature,
    })
}

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

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 */
export const setSender = (sender?: Maybe<string>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    const state = getState()
    const {ticket} = state
    const channels = integrationSelectors.getChannels(state)
    const sourceType = selectors.getNewMessageType(state)
    let _sender: Map<any, any> = fromJS({})

    if (sender) {
        _sender =
            channels.find(
                (channel: Map<any, any>) => channel.get('address') === sender
            ) || fromJS({})
    }

    if (_sender.isEmpty()) {
        _sender =
            getNewMessageSender(ticket, sourceType, channels) || fromJS({})
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
                        IntegrationType.EmailIntegrationType,
                        IntegrationType.GmailIntegrationType,
                        IntegrationType.OutlookIntegrationType,
                    ].includes(channel.get('type'))
            ) || fromJS({})
    }

    if (!_sender.isEmpty()) {
        _sender = fromJS({
            name: _sender.get('name', ''),
            address: _sender.get('address', ''),
        })

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

export const setSourceType = (sourceType: TicketMessageSourceType) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
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
const prepareDefault = (sourceType: TicketMessageSourceType) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    dispatch(setSubject())
    dispatch(setSourceType(sourceType))
    dispatch(setSourceExtra({}))
    resetReceiversAndSender(dispatch, getState)
}

/**
 * Prepare the new message based on its source type
 */
export const prepare = (sourceType: TicketMessageSourceType) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    const state = getState()
    //$TsFixMe remove casting once ticket selectors are migrated
    const currentTicket = (ticketSelectors as {
        getTicket: (state: RootState) => Map<any, any>
    }).getTicket(state)
    // cache source type when changed
    responseUtils.setSourceTypeCache(currentTicket.get('id'), sourceType)

    switch (sourceType) {
        case TicketMessageSourceType.EmailForward: {
            //$TsFixMe remove casting once ticket selectors are migrated
            const messages = (ticketSelectors.getMessages as (
                state: RootState
            ) => List<any>)(state)
            let attachments: FileList | Attachment[] = []

            messages.forEach((message: Map<any, any>) => {
                attachments = (attachments as Array<Attachment>).concat(
                    toJS(message.get('attachments') || fromJS([]))
                )
            })

            const currentAttachments = selectors.getNewMessageAttachments(state)
            const currentAttachmentsUrls = currentAttachments.map(
                (attachment: Map<any, any>) => attachment.get('url') as string
            ) as List<any>

            // Filter out all attachments already present in the state, to avoid setting them again when changing
            // the source type to `email-forward` multiple times
            attachments = attachments.filter(
                (attachment) => !currentAttachmentsUrls.includes(attachment.url)
            )

            dispatch(
                setSubject(`Fwd: ${currentTicket.get('subject', '') as string}`)
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
            // remove signature, if added
            let contentState = selectors.getNewMessageContentState(state)
            const signature = selectors.getNewMessageSignature(state)

            if (
                responseUtils.isSignatureAdded(
                    contentState,
                    signature.get('text')
                )
            ) {
                contentState = responseUtils.removeSignature(
                    contentState,
                    signature
                )
            }

            // update content with removed signature,
            // and focus the editor
            dispatch(
                setResponseText(
                    fromJS({
                        contentState,
                        forceFocus: true,
                        forceUpdate: true,
                    })
                )
            )
            dispatch(prepareDefault(sourceType))

            break
        }
        case TicketMessageSourceType.InstagramComment:
        case TicketMessageSourceType.InstagramAdComment: {
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
export const updatePotentialCustomers = (
    query: string,
    cancelToken?: CancelToken
) => (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> =>
    axios
        .post<ApiListResponse<UserSearchResult[], unknown>>(
            '/api/search/',
            {
                type: 'user_channel_email',
                query,
            },
            {
                cancelToken,
            }
        )
        .then((json) => json?.data)
        .then(
            (resp) => {
                return resp.data.map((result) => {
                    return {
                        ...result,
                        ...result.user,
                    }
                })
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
    // get cached ticket reply message
    dispatch(setResponseText())
    // get cached macro
    dispatch(ticketActions.fetchTicketReplyMacro())
}

/**
 * Perform various actions on the ticket data and return a POST-able ticket data structure.
 * Adds the newMessage to the ticket's messages, attaches actions and sets some source elements on the message.
 * Also sets some properties on the ticket.
 */
export function prepareTicketDataToSend(
    dispatch: StoreDispatch,
    getState: () => RootState,
    ticket: Map<any, any>,
    newMessage: Map<any, any>,
    status: Maybe<string>,
    actionsForMacro: Maybe<MacroActions>,
    currentUser: CurrentUser
): Maybe<{ticket: Ticket; newMessage: NewMessage}> {
    const data: Ticket = toJS(ticket)
    data.newMessage = (toJS(newMessage) as {newMessage: NewMessage}).newMessage
    data.status = status || data.status
    if (data.assignee_user) {
        data.assignee_user = {id: data.assignee_user.id}
    }

    // Prepare newMessage to send it.
    if (data.newMessage) {
        const sourceType = data.newMessage.source.type

        // add signature
        // only on email, if not already added
        if (
            sourceType === TicketMessageSourceType.Email &&
            !newMessage.getIn(['state', 'signatureAdded'], false)
        ) {
            const state = getState()
            const contentState = newMessage.getIn([
                'state',
                'contentState',
            ]) as ContentState
            const signature = selectors.getNewMessageSignature(state)
            const newContentState = responseUtils.addSignature(
                contentState,
                signature
            )
            const bodyText = newContentState
                ? newContentState.getPlainText()
                : ''
            const bodyHtml = newContentState
                ? convertToHTML(newContentState)
                : ''

            if (bodyText) {
                data.newMessage.body_text = bodyText
            }
            if (bodyHtml) {
                data.newMessage.body_html = bodyHtml
            }
        }

        //$TsFixMe remove casting once migrated
        const lastSameTypeMessage = getLastSameSourceTypeMessage(
            ticket.get('messages'),
            sourceType
        ) as Map<any, any>

        if (data.messages.length && lastSameTypeMessage) {
            const lastMessage = lastSameTypeMessage.toJS() as NewMessage

            if (lastMessage.source.extra) {
                data.newMessage.source.extra = _assign(
                    {},
                    data.newMessage.source.extra,
                    lastMessage.source.extra
                )
            }
        }

        // i.e. if we're creating a new ticket
        if (!data.messages.length) {
            data.channel = data.newMessage.channel
        }

        if (!data.newMessage.sender) {
            data.newMessage.sender = fromJS(
                _pick(currentUser.toJS(), ['email', 'id', 'name'])
            )
        }

        // Facebook does not accept comment with just an attachment.
        if (
            data.newMessage.channel === TicketMessageSourceType.Facebook &&
            data.newMessage.source.type ===
                TicketMessageSourceType.FacebookComment
        ) {
            if (
                data.newMessage.body_text.length === 0 &&
                data.newMessage.attachments.length > 0
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

        if (actionsForMacro) {
            data.newMessage.actions = actionsForMacro.map(
                (curAction: Map<any, any> = fromJS({})) =>
                    formatAction(
                        curAction,
                        fromJS(getActionTemplate(curAction.get('name'))),
                        {ticket: ticket.toJS(), currentUser: currentUser.toJS()}
                    )
            ) as List<Map<any, any>>
        }
    }

    const newMessageData = data.newMessage
    delete data.state
    delete data._internal
    delete data.newMessage

    return {
        ticket: data,
        newMessage: newMessageData,
    }
}

export const formatAction = (
    action: Map<any, any>,
    template: Map<any, any>,
    context: Record<string, unknown>
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
            template.get('execution') === 'back' ? 'pending' : 'success'
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
    action: Maybe<string>,
    resetMessage = true,
    retryMessage: Map<any, any>
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<{messageId: number; messageToSend: NewMessage}> =>
        new Promise((resolve, reject) => {
            const {ticket, currentUser, newMessage} = getState()
            // temporary message id
            let messageId = getMomentNow()
            let messageToSend: NewMessage

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
                    return reject()
                }

                messageToSend = dataToSend.newMessage
            }

            // Execute front-end validations for each action of the message
            if (messageToSend.actions) {
                for (const messageAction of (messageToSend.actions as unknown) as Map<
                    any,
                    any
                >[]) {
                    const template = getActionTemplate(
                        (fromJS(messageAction) as Map<any, any>).get('name')
                    ) as ActionTemplate

                    // We can't just have a fallback in the get, in case ticket.customer.data === null
                    const customer: Record<string, unknown> = ((ticket.getIn([
                        'customer',
                    ]) || fromJS({})) as Map<any, any>).toJS()
                    if (template && template.validators) {
                        for (const validator of template.validators) {
                            const res = validator.validate(
                                (customer as unknown) as {integrations: any[]}
                            )

                            if (!res) {
                                dispatch({
                                    type:
                                        constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                                    error: 'Action validation error.',
                                    reason: validator.error,
                                    message: messageToSend,
                                    messageId,
                                })
                                return reject()
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
                messages: (ticketSelectors.getMessages as (
                    state: RootState
                ) => List<any>)(state),
                ticketId: ticket.get('id'),
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
            })
        })
}

export function sendTicketMessage(
    messageId: number,
    messageToSend: NewMessage,
    action: Maybe<string>,
    resetMessage = true,
    ticketId?: string
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> =>
        new Promise((resolve) => {
            const {ticket} = getState()
            let promise

            if (action) {
                promise = axios.put<Message>(
                    `/api/tickets/${
                        ticketId || (ticket.get('id') as number)
                    }/messages/${messageToSend.id || ''}/${
                        action ? `?action=${action}` : ''
                    }`,
                    messageToSend
                )
            } else {
                promise = axios.post<Message>(
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
                            const messages = (ticketSelectors.getMessages as (
                                state: RootState
                            ) => List<any>)(state)

                            dispatch({
                                type:
                                    constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                                resetMessage,
                                resp,
                                messages,
                                messageId,
                            })
                            //$TsFixMe remove casting once utils are migrated
                            const sourceTypeOfResponse = getSourceTypeOfResponse(
                                messages
                            ) as TicketMessageSourceType

                            if (
                                [
                                    TicketMessageSourceType.InstagramComment,
                                    TicketMessageSourceType.InstagramAdComment,
                                ].includes(sourceTypeOfResponse)
                            ) {
                                dispatch(prepare(sourceTypeOfResponse))
                            }
                        }

                        return Promise.resolve(resp)
                    },
                    (error: AxiosError) => {
                        return dispatch({
                            type:
                                constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                            error,
                            verbose: true,
                            reason:
                                'Message was not sent. Please try again in a few moments. If the problem persists contact us.',
                            message: messageToSend,
                            messageId,
                        })
                    }
                )
                .then(resolve)
        })
}

export function retrySubmitTicketMessage(message: Map<any, any>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return dispatch(
            prepareTicketMessage(
                message.getIn(['_internal', 'status']),
                null,
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

        return axios
            .post<TicketResponse>('/api/tickets/', ticketToSend)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    onMessageSent(dispatch)

                    browserHistory.push(`/app/ticket/${resp.id}`)

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

                    return (Promise.resolve(resp) as unknown) as Promise<
                        ReturnType<StoreDispatch>
                    >
                },
                (error) => {
                    return dispatch({
                        type: constants.NEW_MESSAGE_SUBMIT_TICKET_ERROR,
                        error,
                        verbose: true,
                        reason:
                            'Ticket was not created. Please try again in a few moments. If the problem persists contact us',
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
    contentState: ContentState
    newMessage: NewMessage
}>(constants.NEW_MESSAGE_RESET_FROM_MESSAGE)
