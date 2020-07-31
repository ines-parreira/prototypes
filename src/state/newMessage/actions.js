// @flow
import {browserHistory} from 'react-router'
import {fromJS, type Map} from 'immutable'
import {ContentState, type ContentState as ContentStateType} from 'draft-js'
import {createAction} from '@reduxjs/toolkit'

import _isNull from 'lodash/isNull'
import _assign from 'lodash/assign'
import _pick from 'lodash/pick'
import _throttle from 'lodash/throttle'
import axios, {type CancelToken} from 'axios'

import {EMAIL_INTEGRATION_TYPES} from '../../constants/integration'

import * as ticketConstants from '../ticket/constants'

import {notify} from '../notifications/actions'
import * as ticketActions from '../ticket/actions'
import {renderTemplate} from '../../pages/common/utils/template'

import {TicketMessageSourceTypes} from '../../business/ticket'
import {getActionTemplate, uploadFiles, toJS} from '../../utils'
import {convertToHTML} from '../../utils/editor'

import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    getNewMessageSender,
    getLastSameSourceTypeMessage,
    getSourceTypeOfResponse,
    persistLastSenderChannel,
} from '../ticket/utils'

import * as integrationSelectors from '../integrations/selectors'
import * as ticketSelectors from '../ticket/selectors'
import * as agentSelectors from '../agents/selectors'
import {
    AGENT_TYPING_STARTED,
    AGENT_TYPING_STOPPED,
} from '../../config/socketConstants'

import socketManager from '../../services/socketManager'
import type {attachmentType} from '../../types'
import type {
    Dispatch,
    getStateType,
    currentUserType,
    thunkActionType,
} from '../types'
import {getMomentNow} from '../../utils/date'

import {
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
} from '../../config/ticket'

import * as responseUtils from './responseUtils'
import * as selectors from './selectors'
import * as constants from './constants'
import type {MacroActionsType, NewMessageType, TicketType} from './types'

export const addAttachments = (
    ticket: Map<*, *>,
    atts: FileList | attachmentType[]
) => (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
    dispatch({
        type: constants.NEW_MESSAGE_ADD_ATTACHMENT_START,
    })
    const {newMessage} = getState()

    let attachments = atts

    if (
        newMessage.getIn(['newMessage', 'source', 'type']) ===
        TicketMessageSourceTypes.FACEBOOK_COMMENT
    ) {
        // We have specific constraints on attachments.

        const attachmentsFiltered = Object.values(atts).filter((att: any) => {
            const type = att.type || att.content_type
            return type.startsWith('image') || type.startsWith('video')
        })

        const previousAtts =
            newMessage.getIn(['newMessage', 'attachments']) || fromJS([])

        if (
            previousAtts.size > 0 ||
            atts.length > 1 ||
            atts.length !== attachmentsFiltered.length
        ) {
            dispatch(
                notify({
                    id: 'newMessageAddAttachmentsError',
                    dismissAfter: 0,
                    status: 'error',
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
        (resp) => {
            const state = getState()
            const {ticket: _ticket} = state

            if (ticket.get('id') !== _ticket.get('id')) {
                return Promise.resolve()
            }

            return dispatch({
                type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                resp,
            })
        },
        (error) => {
            if (error.response.status === 413) {
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

export const setResponseText = (args: Map<*, *> = fromJS({})) => (
    dispatch: Dispatch,
    getState: getStateType
): Dispatch => {
    const state = getState()
    const {ticket, currentUser, newMessage} = state
    const contentState = args.get('contentState')
    const ticketId = ticket.get('id')
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
                TicketMessageSourceTypes.INTERNAL_NOTE

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
export const addSignature = (contentState: Object, signature: Object) => (
    dispatch: Dispatch,
    getState: getStateType
): Dispatch => {
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
 * @param receivers - object such as {to: [], cc: []}
 * @param replaceAll - boolean true if should replace all recipients properties with the incoming object (to, cc, bcc)
 * or if it only replaces passed properties
 */
export const setReceivers = (
    receivers: {} = {},
    replaceAll: boolean = true
) => ({
    type: constants.NEW_MESSAGE_SET_RECEIVERS,
    receivers,
    replaceAll,
})

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 * @param sender - address of an integration used to communicate. E.g: email, gmail
 */
export const setSender = (sender: ?string) => (
    dispatch: Dispatch,
    getState: getStateType
): Dispatch => {
    const state = getState()
    const {ticket} = state
    const channels = integrationSelectors.getChannels(state)
    const sourceType = selectors.getNewMessageType(state)
    let _sender = fromJS({})

    if (sender) {
        _sender =
            channels.find((channel) => channel.get('address') === sender) ||
            fromJS({})
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
        if (!_sender.get('address').endsWith(window.EMAIL_FORWARDING_DOMAIN)) {
            dispatch(
                notify({
                    status: 'error',
                    message: `You cannot send messages using ${_sender.get(
                        'address'
                    )}, because this address is not verified yet.`,
                })
            )
        }
        _sender =
            channels.find(
                (channel) =>
                    channel.get('verified') === true &&
                    EMAIL_INTEGRATION_TYPES.includes(channel.get('type'))
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

export const setSourceType = (sourceType: string) => (
    dispatch: Dispatch,
    getState: getStateType
): Dispatch => {
    dispatch({
        type: constants.NEW_MESSAGE_SET_SOURCE_TYPE,
        sourceType,
        messages: getState().ticket.get('messages'),
    })
}

export const setSubject = (subject: string = '') => ({
    type: constants.NEW_MESSAGE_SET_SUBJECT,
    subject,
})

export const setSourceExtra = (extra: {}) => ({
    type: constants.NEW_MESSAGE_SET_SOURCE_EXTRA,
    extra,
})

/**
 * Prepare default message
 */
const prepareDefault = (sourceType: string) => (
    dispatch: Dispatch,
    getState: getStateType
): Dispatch => {
    dispatch(setSubject())
    dispatch(setSourceType(sourceType))
    dispatch(setSourceExtra({}))
    resetReceiversAndSender(dispatch, getState)
}

/**
 * Prepare the new message based on its source type
 * @param {String} sourceType the new source type
 */
export const prepare = (sourceType: string) => (
    dispatch: Dispatch,
    getState: getStateType
) => {
    const state = getState()
    const currentTicket = ticketSelectors.getTicket(state)
    // cache source type when changed
    responseUtils.setSourceTypeCache(currentTicket.get('id'), sourceType)

    switch (sourceType) {
        case 'email-forward': {
            const messages = ticketSelectors.getMessages(state)
            let attachments = []

            messages.forEach((message) => {
                attachments = attachments.concat(
                    toJS(message.get('attachments') || fromJS([]))
                )
            })

            const currentAttachments = selectors.getNewMessageAttachments(state)
            const currentAttachmentsUrls = currentAttachments.map(
                (attachment) => attachment.get('url')
            )

            // Filter out all attachments already present in the state, to avoid setting them again when changing
            // the source type to `email-forward` multiple times
            attachments = attachments.filter(
                (attachment) => !currentAttachmentsUrls.includes(attachment.url)
            )

            dispatch(setSubject(`Fwd: ${currentTicket.get('subject', '')}`))
            dispatch(setSourceType('email'))
            dispatch(setSourceExtra({forward: true}))
            dispatch(setSender())
            dispatch(setReceivers())
            dispatch({
                type: constants.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                resp: attachments,
            })
            break
        }
        case 'internal-note': {
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
        case 'instagram-comment':
        case 'instagram-ad-comment': {
            // If we're preparing a new Instagram comment message, we want to insert a mention of format `@username `
            // with the user name of the customer
            dispatch(prepareDefault(sourceType))
            const newState = getState()
            const newMessageState = selectors.getNewMessageState(newState)
            const receiverName = newMessageState.getIn(
                ['newMessage', 'source', 'to', 0, 'name'],
                ''
            )
            const contentState = newMessageState.getIn([
                'state',
                'contentState',
            ])

            // If there's already text in the contentState, or there's no receiver's name, we don't want to add the
            // mention
            if ((contentState && contentState.hasText()) || !receiverName) {
                return
            }

            const newContentState = ContentState.createFromText(
                `@${receiverName} `
            )
            const newSelectionState = responseUtils.selectionAfter(
                newContentState.getBlocksAsArray()
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
 * @param query
 * @returns {function(*)}
 */
export const updatePotentialCustomers = (
    query: string,
    cancelToken?: CancelToken
) => (dispatch: Dispatch): Promise<Dispatch> =>
    axios
        .post(
            '/api/search/',
            {
                type: 'user_channel_email',
                query,
            },
            {
                cancelToken,
            }
        )
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                return resp.data.map((result) => {
                    return {
                        ...result,
                        ...result.user,
                    }
                })
            },
            (error) => {
                if (axios.isCancel(error)) {
                    return Promise.resolve()
                }
                return dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to do the search. Please try again...',
                })
            }
        )

export const initializeMessageDraft = () => (dispatch: Dispatch) => {
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
    dispatch: Dispatch,
    getState: getStateType,
    ticket: Map<*, *>,
    newMessage: Map<*, *>,
    status: ?string,
    actionsForMacro: ?MacroActionsType,
    currentUser: currentUserType
): ?{ticket: TicketType, newMessage: NewMessageType} {
    const data = toJS(ticket)
    data.newMessage = toJS(newMessage).newMessage
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
            sourceType === 'email' &&
            !newMessage.getIn(['state', 'signatureAdded'], false)
        ) {
            const state = getState()
            const contentState = newMessage.getIn(['state', 'contentState'])
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

        let lastSameTypeMessage = getLastSameSourceTypeMessage(
            ticket.get('messages'),
            sourceType
        )

        if (data.messages.length && lastSameTypeMessage) {
            lastSameTypeMessage = lastSameTypeMessage.toJS()

            if (lastSameTypeMessage.source.extra) {
                data.newMessage.source.extra = _assign(
                    {},
                    data.newMessage.source.extra,
                    lastSameTypeMessage.source.extra
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
            data.newMessage.channel === 'facebook' &&
            data.newMessage.source.type === 'facebook-comment'
        ) {
            if (
                data.newMessage.body_text.length === 0 &&
                data.newMessage.attachments.length > 0
            ) {
                dispatch(
                    notify({
                        status: 'error',
                        title: 'Your message cannot be sent',
                        message:
                            'You cannot send an attachment without a message in a Facebook comment.',
                    })
                )
                return null
            }
        }

        if (actionsForMacro) {
            data.newMessage.actions = actionsForMacro.map((curAction) =>
                formatAction(
                    curAction,
                    fromJS(getActionTemplate(curAction.get('name'))),
                    {ticket: ticket.toJS(), currentUser: currentUser.toJS()}
                )
            )
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
    action: Map<*, *>,
    template: Map<*, *>,
    context: {}
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

    let newArgs = fromJS({})

    action.get('arguments').forEach((value, key) => {
        if (template.getIn(['arguments', key, 'type']) === 'listDict') {
            newArgs = newArgs.set(key, fromJS({}))
            value.forEach((element) => {
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
function onMessageSent(dispatch: Dispatch) {
    // reinitialize the current macro
    dispatch({
        type: ticketConstants.APPLY_MACRO,
        macro: undefined,
    })
}

export function prepareTicketMessage(
    status: ?string,
    macroActions: ?MacroActionsType,
    action: ?string,
    resetMessage: boolean = true,
    retryMessage: Map<*, *>
): thunkActionType {
    return (
        dispatch: Dispatch,
        getState: getStateType
    ): Promise<{messageId: number, messageToSend: NewMessageType}> =>
        new Promise((resolve, reject) => {
            const {ticket, currentUser, newMessage} = getState()
            // temporary message id
            let messageId = getMomentNow()
            let messageToSend: NewMessageType

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
                for (const messageAction of messageToSend.actions) {
                    const template = getActionTemplate(
                        fromJS(messageAction).get('name')
                    )

                    // We can't just have a fallback in the get, in case ticket.customer.data === null
                    const customer = (
                        ticket.getIn(['customer']) || fromJS({})
                    ).toJS()
                    if (template && template.validators) {
                        for (const validator of template.validators) {
                            const res = validator.validate(customer)

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

            let state = getState()

            dispatch({
                type: constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                message: messageToSend,
                messageId,
                resetMessage,
                retry: !!retryMessage,
                status: status,
                messages: ticketSelectors.getMessages(state),
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
    messageId: string,
    messageToSend: NewMessageType,
    action: ?string,
    resetMessage: boolean = true,
    ticketId: ?string
) {
    return (
        dispatch: Dispatch,
        getState: getStateType
    ): Promise<Dispatch | {}> =>
        new Promise((resolve) => {
            const {ticket} = getState()
            let promise

            if (action) {
                promise = axios.put(
                    `/api/tickets/${ticketId || ticket.get('id')}/messages/${
                        // $FlowFixMe
                        messageToSend.id
                    }/${action ? `?action=${action}` : ''}`,
                    messageToSend
                )
            } else {
                promise = axios.post(
                    `/api/tickets/${ticketId || ticket.get('id')}/messages/`,
                    messageToSend
                )
            }
            promise
                .then((json = {}) => json.data)
                .then(
                    (resp) => {
                        let state = getState()
                        let {ticket: _ticket} = state

                        // if we changed the displayed ticket (e.g. submit and close), we don't want to change the state.
                        if (
                            !(
                                resp.ticket_id !== _ticket.get('id') &&
                                _ticket.get('id')
                            )
                        ) {
                            const messages = ticketSelectors.getMessages(state)

                            dispatch({
                                type:
                                    constants.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                                resetMessage,
                                resp,
                                messages,
                                messageId,
                            })

                            const sourceTypeOfResponse = getSourceTypeOfResponse(
                                messages
                            )

                            if (
                                [
                                    INSTAGRAM_COMMENT_SOURCE,
                                    INSTAGRAM_AD_COMMENT_SOURCE,
                                ].includes(sourceTypeOfResponse)
                            ) {
                                dispatch(prepare(sourceTypeOfResponse))
                            }
                        }

                        return Promise.resolve(resp)
                    },
                    (error) => {
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

export function retrySubmitTicketMessage(message: Map<*, *>): thunkActionType {
    return (dispatch: Dispatch): Promise<Dispatch | {}> => {
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
    ticket: Map<*, *>,
    status: ?string,
    macroActions: ?MacroActionsType,
    currentUser: currentUserType,
    resetMessage: boolean = true
) {
    return (dispatch: Dispatch, getState: getStateType): ?Promise<Dispatch> => {
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
            .post('/api/tickets/', ticketToSend)
            .then((json = {}) => json.data)
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

                    return Promise.resolve(resp)
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

export function resetFromTicket(ticket: Map<*, *>) {
    return (dispatch: Dispatch): Dispatch => {
        dispatch({
            type: constants.NEW_MESSAGE_RESET_FROM_TICKET,
            ticket,
        })
        return dispatch(resetReceiversAndSender)
    }
}

export function resetReceiversAndSender(
    dispatch: Dispatch,
    getState: getStateType
): Dispatch {
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

export const newMessageResetFromMessage = createAction<
    typeof constants.NEW_MESSAGE_RESET_FROM_MESSAGE,
    {contentState: ContentStateType, newMessage: NewMessageType}
>(constants.NEW_MESSAGE_RESET_FROM_MESSAGE)
