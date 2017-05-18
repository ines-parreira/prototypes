import React from 'react'
import {browserHistory} from 'react-router'
import {fromJS} from 'immutable'

import _isNull from 'lodash/isNull'
import _pick from 'lodash/pick'
import axios from 'axios'

import * as types from './constants'
import * as ticketTypes from '../ticket/constants'

import {notify} from '../notifications/actions'
import * as ticketActions from '../ticket/actions'
import {renderTemplate} from '../../pages/common/utils/template'
import {
    getLastMessage,
    getActionTemplate,
    uploadFiles,
    toJS,
} from '../../utils'
import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    getNewMessageSender,
    getLastSameSourceTypeMessage,
} from '../ticket/utils'
import * as integrationSelectors from '../integrations/selectors'
import * as ticketSelectors from '../ticket/selectors'
import * as selectors from './selectors'

export const addAttachments = (ticket, atts) => (dispatch, getState) => {
    dispatch({
        type: types.NEW_MESSAGE_ADD_ATTACHMENT_START
    })

    let attachments = atts

    if (ticket.getIn(['newMessage', 'source', 'type']) === 'facebook-comment') {
        // We have specific constraints on attachments.

        const attsFiltered = atts.filter(
            (att) => (att.content_type.startsWith('image')) || (att.content_type.startsWith('video')))

        const previousAtts = ticket.getIn(['newMessage', 'attachments'])

        if ((previousAtts.size > 0) || (atts.length > 1) || atts.length !== attsFiltered.length) {
            dispatch(notify({
                autoDismiss: false,
                type: 'error',
                title: 'We could not add all of your attachments !',
                children: (
                    <div>
                        Facebook comments have limitations on attachments:
                        <ul>
                            <li>You cannot send more than one attachment.</li>
                            <li>You can only send images or videos.</li>
                        </ul>
                    </div>
                )
            }))
            return dispatch({
                type: types.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
            })
        }

        attachments = previousAtts.size > 0 ? [] : attsFiltered.slice(0, 1)
    }

    return uploadFiles(attachments)
        .then(resp => {
            const state = getState()
            const {ticket: _ticket} = state

            if (ticket.get('id') !== _ticket.get('id')) {
                return Promise.resolve()
            }

            return dispatch({
                type: types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.NEW_MESSAGE_ADD_ATTACHMENT_ERROR,
                error,
                reason: 'Failed to upload files. Please try again later'
            })
        })
}

export const deleteAttachment = (index) => ({
    type: types.NEW_MESSAGE_DELETE_ATTACHMENT,
    index
})

export const setResponseText = (args = fromJS({})) => (dispatch, getState) => {
    const state = getState()
    const {ticket, currentUser} = state

    // should have the same params in state/ticket/actions/applyMacroAction
    return dispatch({
        type: types.SET_RESPONSE_TEXT,
        args,
        ticketId: ticket.get('id'),
        ticket, // used in middleware, not in reducer
        appliedMacro: ticket.getIn(['state', 'appliedMacro']),
        currentUser, // used in middleware, not in reducer
        fromMacro: false, // used in middleware, not in reducer
    })
}

/**
 * Set new message receivers
 * @param receivers - object such as {to: [], cc: []}
 * @param replaceAll - boolean true if should replace all recipients properties with the incoming object (to, cc, bcc)
 * or if it only replaces passed properties
 */
export const setReceivers = (receivers = {}, replaceAll = true) => ({
    type: types.NEW_MESSAGE_SET_RECEIVERS,
    receivers,
    replaceAll,
})

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 * @param sender - address of an integration used to communicate. E.g: email, gmail
 */
export const setSender = (sender) => (dispatch, getState) => {
    const state = getState()
    const {ticket} = state
    const channels = integrationSelectors.getChannels(state)
    const sourceType = selectors.getNewMessageType(state)
    let _sender = null

    if (sender) {
        _sender = channels.find(channel => channel.get('address') === sender)
    }

    if (!_sender) {
        _sender = getNewMessageSender(ticket, sourceType, channels)
    }

    if (!_sender.isEmpty()) {
        _sender = fromJS({
            name: _sender.get('name', ''),
            address: _sender.get('address', '')
        })
    }

    dispatch({
        type: types.NEW_MESSAGE_SET_SENDER,
        sender: _sender
    })
}

export const setSourceType = (sourceType) => (dispatch, getState) => {
    const state = getState()
    const {ticket} = state

    dispatch({
        type: types.NEW_MESSAGE_SET_SOURCE_TYPE,
        sourceType,
        messages: ticket.get('messages'),
    })

    return resetReceiversAndSender(dispatch, getState)
}

/**
 * Only getting potential requesters and calling a callback
 * No reducer action after that
 * @param query
 * @returns {function(*)}
 */
export const updatePotentialRequesters = query => (dispatch) => (
    axios.post('/api/search/', {
        type: 'user_channel',
        query
    })
        .then((json = {}) => json.data)
        .then(resp => {
            return resp.data.map((result) => {
                return {
                    ...result,
                    ...result.user
                }
            })
        }, error => {
            return dispatch({
                type: 'ERROR',
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
)

export const initializeMessageDraft = () => (dispatch) => {
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
function prepareTicketDataToSend(dispatch, ticket, newMessage, status, macroActions, currentUser) {
    const data = toJS(ticket)
    data.newMessage = toJS(newMessage).newMessage

    data.status = status || data.status
    if (data.assignee_user) {
        data.assignee_user = {id: data.assignee_user.id}
    }

    // Prepare newMessage to send it.
    if (data.newMessage) {
        const sourceType = data.newMessage.source.type

        let lastSameTypeMessage = getLastSameSourceTypeMessage(ticket.get('messages'), sourceType)

        if (data.messages.length && lastSameTypeMessage) {
            lastSameTypeMessage = lastSameTypeMessage.toJS()

            if (lastSameTypeMessage.source.extra) {
                data.newMessage.source.extra = lastSameTypeMessage.source.extra
            }
        }

        // i.e. if we're creating a new ticket
        if (!data.messages.length) {
            data.channel = data.newMessage.channel
        }

        if (!data.newMessage.sender) {
            data.newMessage.sender = fromJS(_pick(currentUser.toJS(), ['email', 'id', 'name']))
        }

        // Facebook does not accept comment with just an attachment.
        if (data.newMessage.channel === 'facebook') {
            if ((data.newMessage.body_text.length === 0) && (data.newMessage.attachments.length > 0)) {
                dispatch(notify({
                    type: 'error',
                    title: 'Your message cannot be sent',
                    message: 'You cannot send an attachment without a message in a Facebook comment.'
                }))
                return null
            }
        }

        if ((data.newMessage.body_text.length > 0) || (data.newMessage.attachments.length > 0)) {
            if (macroActions) {
                data.newMessage.actions = macroActions.map(curAction => formatAction(
                    curAction,
                    fromJS(getActionTemplate(curAction.get('name'))),
                    {ticket: ticket.toJS(), currentUser: currentUser.toJS()}
                ))
            }
            data.messages.push(data.newMessage)
        } else if (!data.messages.length) {
            dispatch(notify({
                type: 'error',
                title: 'You need to write a message.',
                message: 'You can\'t create a new ticket without at least a message.'
            }))
            return null
        }

        delete data.newMessage
    }

    delete data.state
    delete data._internal
    return data
}

export const formatAction = (action, template, context) => {
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
            value.forEach(element => {
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

    return action.set('arguments', newArgs).set('status', template.get('execution') === 'back' ? 'pending' : 'success')
}

/**
 * Perform actions when we successfully create a new message.
 */
function onMessageSent(dispatch) {
    // reinitialize the current macro
    dispatch({
        type: ticketTypes.APPLY_MACRO,
        macro: undefined
    })
}

/**
 * @param action: A parameter to decide on what to do when an action failed. (Retry/ignore/cancel, etc.)
 */
export function submitTicketMessage(status, macroActions, action, resetMessage = true) {
    return (dispatch, getState) => {
        const {ticket, currentUser, newMessage} = getState()

        dispatch({
            type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
        })

        const data = prepareTicketDataToSend(dispatch, ticket, newMessage, status, macroActions, currentUser)

        if (!data || _isNull(data)) {
            return dispatch({
                type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                reason: 'Message was not sent. Sent data is invalid.'
            })
        }

        const messageToSend = getLastMessage(data.messages)

        // Execute front-end validations for each action of the message
        if (messageToSend.actions) {
            for (const messageAction of messageToSend.actions) {
                const template = getActionTemplate(messageAction.get('name'))

                if (template.validators) {
                    // We can't just have a fallback in the get, in case ticket.requester.customer === null
                    const customer = (ticket.getIn(['requester', 'customer']) || fromJS({})).toJS()

                    for (const validator of template.validators) {
                        const res = validator.validate(customer)

                        if (!res) {
                            return dispatch({
                                type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                                error: 'Action validation error.',
                                reason: validator.error
                            })
                        }
                    }
                }
            }
        }

        let promise

        if (action) {
            promise = axios.put(
                `/api/tickets/${ticket.get('id')}/messages/${messageToSend.id}/${action ? `?action=${action}` : ''}`,
                messageToSend
            )
        } else {
            promise = axios.post(`/api/tickets/${ticket.get('id')}/messages/`, messageToSend)
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                onMessageSent(dispatch)

                let state = getState()
                let {ticket: _ticket} = state

                // if we changed the displayed ticket (e.g. submit and close), we dont want to change the state.
                if (!(resp.ticket_id !== _ticket.get('id') && _ticket.get('id'))) {
                    dispatch({
                        type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_SUCCESS,
                        resetMessage,
                        resp,
                        messages: ticketSelectors.getMessages(state),
                    })
                }

                // We're trying to add a signature if any
                dispatch(setResponseText())

                return resetReceiversAndSender(dispatch, getState)
            }, error => {
                return dispatch({
                    type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_ERROR,
                    error,
                    reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.'
                })
            })
    }
}

export function submitTicket(ticket, status, macroActions, currentUser, resetMessage = true) {
    return (dispatch, getState) => {
        const {newMessage} = getState()

        dispatch({
            type: types.NEW_MESSAGE_SUBMIT_TICKET_START
        })

        const data = prepareTicketDataToSend(dispatch, ticket, newMessage, status, macroActions, currentUser)

        return axios.post('/api/tickets/', data)
            .then((json = {}) => json.data)
            .then(resp => {
                onMessageSent(dispatch)

                browserHistory.push(`/app/ticket/${resp.id}`)

                const state = getState()
                const {ticket} = state

                if (resp.id !== ticket.get('id') && ticket.get('id')) {
                    return Promise.resolve({resp})
                }

                // dispatch for ticket reducer branch
                dispatch({
                    type: ticketTypes.SUBMIT_TICKET_SUCCESS,
                    resp
                })

                // dispatch for newMessage reducer branch
                dispatch({
                    type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                    resetMessage,
                    resp,
                })

                return resetReceiversAndSender(dispatch, getState)
            }, error => {
                return dispatch({
                    type: types.NEW_MESSAGE_SUBMIT_TICKET_ERROR,
                    error,
                    reason: 'Ticket was not created. Please try again in a few moments. If the problem persists contact us'
                })
            })
    }
}

export function resetReceiversAndSender(dispatch, getState) {
    const state = getState()
    const {ticket} = state
    const type = selectors.getNewMessageType(state)
    // set receivers according to last sent message
    const receivers = guessReceiversFromTicket(ticket, type, integrationSelectors.getChannelsByType(type)(state))
    const receiversValues = receiversValueFromState(receivers, type)
    dispatch(setReceivers(receiversStateFromValue(receiversValues, type)))
    // set sender according to last sent message
    return dispatch(setSender())
}
