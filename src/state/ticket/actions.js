import React from 'react'
import {browserHistory} from 'react-router'

import _isEmpty from 'lodash/isEmpty'
import _isNull from 'lodash/isNull'
import _pick from 'lodash/pick'
import _noop from 'lodash/noop'
import axios from 'axios'

import * as types from './constants'
import {fromJS} from 'immutable'
import {DEFAULT_ACTIONS} from '../../config'
import {setMacrosVisible} from '../macro/actions'
import {TICKET_VIEWED} from '../activity/constants'
import {notify} from '../notifications/actions'
import {renderTemplate} from '../../pages/common/utils/template'
import {getLastSameSourceTypeMessage} from './utils'
import {getLastMessage, isCurrentlyOnTicket, getActionTemplate, uploadFiles} from '../../utils'
import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    buildPartialUpdateFromAction,
    getNewMessageSender
} from './utils'
import * as integrationSelectors from '../integrations/selectors'

export const addAttachments = (ticket, atts) => (dispatch) => {
    dispatch({
        type: types.ADD_ATTACHMENT_START
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
                type: types.ADD_ATTACHMENT_ERROR,
            })
        }

        attachments = previousAtts.size > 0 ? [] : attsFiltered.slice(0, 1)
    }

    return uploadFiles(attachments)
        .then(resp => {
            return dispatch({
                type: types.ADD_ATTACHMENT_SUCCESS,
                ticketId: ticket.get('id'),
                resp
            })
        }, error => {
            return dispatch({
                type: types.ADD_ATTACHMENT_ERROR,
                error,
                reason: 'Failed to upload files. Please try again later'
            })
        })
}

export const deleteAttachment = (index) => ({
    type: types.DELETE_ATTACHMENT,
    index
})

export const recordMacro = (macro) => ({
    type: types.RECORD_MACRO,
    macro
})

export const receivedMacro = () => ({
    type: types.RECEIVED_MACRO
})

export const mergeTicket = (ticket) => {
    return {
        type: types.MERGE_TICKET,
        ticket,
    }
}

export const mergeRequester = (user) => {
    return {
        type: types.MERGE_REQUESTER,
        user,
    }
}

export const ticketPartialUpdate = (args) => (dispatch, getState) => {
    if (_isEmpty(args)) {
        return Promise.resolve()
    }

    const {ticket} = getState()
    const ticketId = ticket.get('id')

    // do not send to server if it's a partial update on a new ticket
    if (!ticketId) {
        return Promise.resolve()
    }

    dispatch({
        type: types.TICKET_PARTIAL_UPDATE_START,
        args,
    })

    return axios.put(`/api/tickets/${ticketId}/`, args)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.TICKET_PARTIAL_UPDATE_ERROR,
                error,
                reason: `Failed to update ticket ${ticketId}`
            })
        })
}

export const addTags = (tags) => (dispatch, getState) => {
    dispatch({
        type: types.ADD_TICKET_TAGS,
        args: fromJS({tags}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const removeTag = (tag) => (dispatch, getState) => {
    dispatch({
        type: types.REMOVE_TICKET_TAG,
        args: fromJS({tag}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const togglePriority = (priority = null) => (dispatch, getState) => { // priority argument is optional
    dispatch({
        type: types.TOGGLE_PRIORITY,
        args: fromJS({priority}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setPriority', getState())))
}

export const setAgent = (assigneeUser) => (dispatch, getState) => {
    dispatch({
        type: types.SET_AGENT,
        args: fromJS({assignee_user: assigneeUser}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setAssignee', getState())))
}

export const setStatus = (status, onClose = _noop) => (dispatch, getState) => {
    dispatch({
        type: types.SET_STATUS,
        args: fromJS({status}),
    })

    if (status === 'closed') {
        dispatch(notify({
            type: 'success',
            message: 'The ticket has been closed.'
        }))

        onClose()
    }

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setStatus', getState())))
}

export const setSubject = (subject) => (dispatch, getState) => {
    dispatch({
        type: types.SET_SUBJECT,
        args: fromJS({subject}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setSubject', getState())))
}

export const setResponseText = (args = fromJS({})) => (dispatch, getState) => {
    return dispatch({
        type: types.SET_RESPONSE_TEXT,
        args,
        currentUser: getState().currentUser, // used in middleware, not in reducer
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
    type: types.SET_RECEIVERS,
    receivers,
    replaceAll,
})

/**
 * Set new message sender. A sender is represented by an integration (email or gmail)
 * @param sender - address of an integration used to communicate. E.g: email, gmail
 */
export const setSender = (sender) => (dispatch, getState) => {
    const ticket = getState().ticket
    const channels = integrationSelectors.getChannels(getState())
    let _sender = null

    if (sender) {
        _sender = channels.find(channel => channel.get('address') === sender)
    }

    if (!_sender) {
        _sender = getNewMessageSender(ticket, channels)
    }

    if (!_sender.isEmpty()) {
        _sender = fromJS({
            name: _sender.get('name', ''),
            address: _sender.get('address', '')
        })
    }

    dispatch({
        type: types.SET_SENDER,
        sender: _sender
    })
}

export const setSourceType = (sourceType) => ({
    type: types.SET_SOURCE_TYPE,
    sourceType
})

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

export const markTicketDirty = (dirty = true) => ({
    type: types.MARK_TICKET_DIRTY,
    dirty
})

export const deleteMessage = (ticketId, messageId) => (dispatch) => {
    dispatch({
        type: types.DELETE_TICKET_MESSAGE_START
    })

    return axios.delete(`/api/tickets/${ticketId}/messages/${messageId}/`)
        .then((json = {}) => json.data)
        .then(() => {
            dispatch({
                type: types.DELETE_TICKET_MESSAGE_SUCCESS,
                messageId
            })
        }, error => {
            return dispatch({
                type: types.DELETE_TICKET_MESSAGE_ERROR,
                error,
                reason: `Failed to delete message ${messageId} from ticket ${ticketId}`
            })
        })
}

export const deleteActionOnApplied = (actionIndex, ticketId) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId
})

export const updateActionArgsOnApplied = (actionIndex, value, ticketId) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId
})

export const applyMacroAction = (action) => (dispatch, getState) => {
    const {type, name} = action.toJS()
    if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
        console.error('Applying unknown macro action', name)
    }

    const args = action.get('arguments')

    dispatch({
        type: name,
        args,
        currentUser: getState().currentUser, // used in middleware, not in reducer
        fromMacro: true, // used in middleware, not in reducer
    })
}

const renderObject = (argument, context) => {
    let ret = argument

    if (typeof argument === 'string') {
        ret = renderTemplate(argument, context)
    } else if (typeof argument === 'object') {
        ret = argument.map(v => renderObject(v, context))
    }

    return ret
}

export const applyMacro = (macro, ticketId) => (dispatch, getState) => {
    // render macro action arguments
    let state = getState()
    const ticketState = state.ticket.toJS()

    const renderedMacro = macro.set('actions', macro.get('actions').map(
        action => action.set('arguments', action.get('arguments').map(
            argument => renderObject(argument, {ticket: ticketState})
        ))
    ))

    dispatch({
        type: types.APPLY_MACRO,
        macro: renderedMacro,
        ticketId
    })

    const actions = macro.get('actions', fromJS([]))

    actions.forEach(action => dispatch(applyMacroAction(action)))

    state = getState() // refetch state after macro actions has been applied

    const actionNames = actions.map(a => a.get('name')).toJS()
    const partialUpdate = buildPartialUpdateFromAction(actionNames, state)

    dispatch(ticketPartialUpdate(partialUpdate))

    dispatch({
        type: types.RECORD_MACRO,
        macro
    })

    dispatch(setMacrosVisible(false))
}

export const clearAppliedMacro = (ticketId) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId
})

export const fetchTicketReplyMacro = () => ({
    type: types.FETCH_TICKET_REPLY_MACRO
})

export const initializeMessageDraft = () => (dispatch) => {
    // get cached ticket reply message
    dispatch(setResponseText())
    // get cached macro
    dispatch(fetchTicketReplyMacro())
}

export const fetchTicket = (ticketId, displayLoading = true) => (dispatch) => {
    if (ticketId === 'new') {
        return dispatch(initializeMessageDraft())
    }

    dispatch({
        type: types.FETCH_TICKET_START,
        displayLoading,
    })

    dispatch({
        type: TICKET_VIEWED,
        ticketId
    })

    const url = `/api/tickets/${ticketId}/`

    return axios.get(url)
        .then((json = {}) => json.data)
        .then(resp => {
            if (_isEmpty(resp)) {
                console.error('No results for', url)
            }

            if (isCurrentlyOnTicket(ticketId)) {
                dispatch({
                    type: types.FETCH_TICKET_SUCCESS,
                    resp,
                    ticketId: parseInt(ticketId),
                    displayLoading,
                })
                dispatch(initializeMessageDraft())
            }
        }, error => {
            return displayLoading
                ? dispatch({
                    type: types.FETCH_TICKET_ERROR,
                    error,
                    reason: `Failed to fetch ticket ${ticketId}`
                })
                : null
        })
}

export const notifyMessageActionError = (ticketId) => (dispatch) => {
    return dispatch(notify({
        type: 'error',
        title: 'Something went wrong on your last message :/',
        autoDismiss: false,
        children: (
            <div>
                <p>
                    The message was not sent because an action broke on it, you should review it right now.
                </p>
                <div className="buttons">
                    <button
                        className="ui tiny button green"
                        onClick={() => browserHistory.push(`/app/ticket/${ticketId}`)}
                    >
                        Review message
                    </button>
                </div>
            </div>
        )
    }))
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
 * Perform various actions on the ticket data and return a POST-able ticket data structure.
 * Adds the newMessage to the ticket's messages, attaches actions and sets some source elements on the message.
 * Also sets some properties on the ticket.
 */
function prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser) {
    const data = ticket.toJS()

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
            delete data.newMessage.contentState
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

/**
 * Perform actions when we successfully create a new message.
 */
function onMessageSent(dispatch) {
    // reinitialize the current macro
    dispatch({
        type: types.APPLY_MACRO,
        macro: undefined
    })
}

/**
 * @param action: A parameter to decide on what to do when an action failed. (Retry/ignore/cancel, etc.)
 */
export function submitTicketMessage(status, macroActions, action, resetMessage = true) {
    return (dispatch, getState) => {
        const {ticket, currentUser} = getState()

        dispatch({
            type: types.SUBMIT_TICKET_MESSAGE_START,
        })

        const data = prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser)

        if (!data || _isNull(data)) {
            return dispatch({
                type: types.SUBMIT_TICKET_MESSAGE_ERROR,
                reason: 'Message was not sent. Sent data is invalid.'
            })
        }

        const messageToSend = getLastMessage(data.messages)

        // Execute front-end validations for each action of the message
        if (messageToSend.actions) {
            for (const messageAction of messageToSend.actions) {
                const template = getActionTemplate(messageAction.get('name'))

                if (template.validators) {
                    for (const validator of template.validators) {
                        const res = validator.validate(ticket.getIn(['requester', 'customer'], fromJS({})).toJS())

                        if (!res) {
                            return dispatch({
                                type: types.SUBMIT_TICKET_MESSAGE_ERROR,
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

                dispatch({
                    type: types.SUBMIT_TICKET_MESSAGE_SUCCESS,
                    resetMessage,
                    resp
                })

                // TODO @jebarjonet improve the flow of receivers reselection
                // here we are normalizing receivers data before we send it
                const state = getState()
                const {ticket: _ticket} = state
                const type = _ticket.getIn(['newMessage', 'source', 'type'])
                // set receivers according to last sent message
                const receivers = guessReceiversFromTicket(_ticket, integrationSelectors.getChannelsByType(type)(state))
                const receiversValues = receiversValueFromState(receivers, type)
                dispatch(setReceivers(receiversStateFromValue(receiversValues, type)))
                // set sender according to last sent message
                dispatch(setSender())

                // We're trying to add a signature if any
                dispatch(setResponseText())
            }, error => {
                return dispatch({
                    type: types.SUBMIT_TICKET_MESSAGE_ERROR,
                    error,
                    reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.'
                })
            })
    }
}

export function updateTicketMessage(ticketId, messageId, data, action = null) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_TICKET_MESSAGE_START,
            messageId
        })

        let url = `/api/tickets/${ticketId}/messages/${messageId}/`

        if (action) {
            url = `${url}?action=${action}`
        }

        return axios.put(url, data)
            .then((json = {}) => json.data)
            .then(resp => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_SUCCESS,
                    messageId,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_ERROR,
                    messageId,
                    error,
                    reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.'
                })
            })
    }
}

export function submitTicket(ticket, status, macroActions, currentUser, resetMessage = true) {
    return (dispatch) => {
        dispatch({
            type: types.SUBMIT_TICKET_START
        })

        const data = prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser)

        return axios.post('/api/tickets/', data)
            .then((json = {}) => json.data)
            .then(resp => {
                onMessageSent(dispatch)

                browserHistory.push(`/app/ticket/${resp.id}`)

                return dispatch({
                    type: types.SUBMIT_TICKET_SUCCESS,
                    resetMessage,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.SUBMIT_TICKET_ERROR,
                    error,
                    reason: 'Ticket was not created. Please try again in a few moments. If the problem persists contact us'
                })
            })
    }
}

export function clearTicket() {
    return (dispatch, getState) => {
        const shouldDisplayHistoryOnNextPage = getState().ticket.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])

        dispatch(setMacrosVisible(true))
        dispatch({
            type: types.CLEAR_TICKET,
            shouldDisplayHistoryOnNextPage
        })
    }
}

export function toggleHistory(state) {
    return {
        type: types.TOGGLE_HISTORY,
        state
    }
}

export function displayHistoryOnNextPage(state = true) {
    return {
        type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
        state
    }
}
