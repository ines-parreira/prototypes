import axios from 'axios'
import React from 'react'
import _ from 'lodash'
import {browserHistory} from 'react-router'
import Immutable, {Map, Set} from 'immutable'
import {notify} from '../notifications/actions'
import {ACTION_TEMPLATES, USER_VALUE_PROP, SOURCE_VALUE_PROP} from '../../config'
import {renderTemplate} from '../../pages/common/utils/template'
import {lastMessage} from '../../utils'
import {TICKET_VIEWED} from '../activity/constants'
import {APPLY_MACRO} from '../macro/constants'
import * as types from './constants'

export function addAttachments(ticket, atts) {
    return (dispatch) => {
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
            }

            attachments = previousAtts.size > 0 ? [] : attsFiltered.slice(0, 1)
        }

        const formData = new window.FormData()

        for (const attachment of attachments) {
            formData.append(attachment.name, attachment.file)
        }

        return axios.post('/api/upload/', formData)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.ADD_ATTACHMENT_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.ADD_ATTACHMENT_ERROR,
                    error,
                    reason: 'Failed to upload files. Please try again later'
                })
            })
    }
}

export function deleteAttachment(index) {
    return {
        type: types.DELETE_ATTACHMENT,
        index
    }
}

export function recordMacro(macro) {
    return {
        type: types.RECORD_MACRO,
        macro
    }
}

export function receivedMacro() {
    return {
        type: types.RECEIVED_MACRO
    }
}

export function ticketPartialUpdate(ticketId, args, nextUrl = null) {
    return (dispatch) => {
        dispatch({
            type: types.TICKET_PARTIAL_UPDATE_START
        })

        return axios.put(`/api/tickets/${ticketId}/`, args)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                    resp
                })

                // show a success message if we closed the ticket
                if (args.status === 'closed') {
                    dispatch(notify({
                        type: 'success',
                        message: 'The ticket has been closed.'
                    }))

                    // Redirect to the next ticket after the transition is done.
                    // Timeout also needed for the notification to stay up, otherwise the redirect will hide it.
                    if (nextUrl) {
                        setTimeout(() => browserHistory.push(nextUrl), nextUrl.includes('tickets') ? 800 : 300)
                    }
                }
            })
            .catch(error => {
                dispatch({
                    type: types.TICKET_PARTIAL_UPDATE_ERROR,
                    error,
                    reason: `Failed to update ticket ${ticketId}`
                })
            })
    }
}

export function addTags(tags) {
    return {
        type: types.ADD_TICKET_TAGS,
        args: tags
    }
}

export function removeTag(index) {
    return {
        type: types.REMOVE_TICKET_TAG,
        index
    }
}

export function togglePriority(priority) { // here, the priority argument is optional
    return {
        type: types.TOGGLE_PRIORITY,
        args: Map({
            priority: priority.isString ? priority : null
        })
    }
}

/* eslint "camelcase": "off" */
export function setAgent(assignee_user) {
    return {
        type: types.SET_AGENT,
        args: Map({
            assignee_user
        })
    }
}

export function setStatus(status, id = null) {
    return {
        type: types.SET_STATUS,
        args: Map({
            status,
            id
        })
    }
}

export function setPublic(isPublic) {
    return {
        type: types.SET_PUBLIC,
        isPublic
    }
}

export function setSubject(subject) {
    return {
        type: types.SET_SUBJECT,
        args: Map({
            subject
        })
    }
}

export function setReceivers(receivers) {
    return {
        type: types.SET_RECEIVERS,
        receivers
    }
}

export function setSourceType(sourceType) {
    return (dispatch) => {
        dispatch({
            type: types.SET_SOURCE_TYPE,
            sourceType
        })
    }
}

/**
 * Only getting potential requesters and calling a callback
 * No reducer action after that
 * @param query
 * @param callback
 * @returns {function(*)}
 */
export function updatePotentialRequesters(query, callback) {
    return (dispatch) => {
        return axios.post('/api/search/', {
            doc_type: 'user_channel',
            query
        })
            .then((json = {}) => json.data)
            .then(resp => {
                const response = resp.data.map((result) => {
                    return {
                        ...result,
                        ...result.user
                    }
                })

                callback(null, response)
            })
            .catch(error => {
                dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Failed to do the search. Please try again...'
                })
            })
    }
}

export function setResponseText(currentUser, args) {
    return {
        type: types.SET_RESPONSE_TEXT,
        args,
        currentUser,
        fromMacro: false
    }
}

export function markTicketDirty(dirty = true) {
    return {
        type: types.MARK_TICKET_DIRTY,
        dirty
    }
}

export function setupNewTicket() {
    return {
        type: types.SETUP_NEW_TICKET
    }
}

export function deleteMessage(ticketId, messageId) {
    return (dispatch) => {
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
            })
            .catch(error => {
                dispatch({
                    type: types.DELETE_TICKET_MESSAGE_ERROR,
                    error,
                    reason: `Failed to delete message ${messageId} from ticket ${ticketId}`
                })
            })
    }
}

export function fetchTicket(ticketId, displayLoading = true) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_TICKET_START,
            displayLoading
        })

        dispatch({
            type: TICKET_VIEWED,
            ticketId
        })

        const url = `/api/tickets/${ticketId}/`

        return axios.get(url)
            .then((json = {}) => json.data)
            .then(resp => {
                if (_.isEmpty(resp)) {
                    console.error('No results for', url)
                }

                dispatch({
                    type: types.FETCH_TICKET_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_TICKET_ERROR,
                    error,
                    reason: `Failed to fetch ticket ${ticketId}`
                })
            })
    }
}

export function fetchTicketMessage(ticketId, messageId) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_MESSAGE_START
        })

        return axios.get(`/api/tickets/${ticketId}/messages/${messageId}/`)
            .then((json = {}) => json.data)
            .then(resp => {
                const hasFailure = resp.actions.find(action => action.status === 'error')
                const hasPending = resp.actions.find(action => action.status === 'pending')

                if (hasFailure) {
                    dispatch(notify({
                        type: 'error',
                        title: 'Some actions failed on your last message :/',
                        autoDismiss: false,
                        children: (
                            <div>
                                <ul>
                                    {
                                        resp.actions.map((action, idx) => {
                                            if (ACTION_TEMPLATES[action.name].execution === 'back') {
                                                return (
                                                    <li key={idx}>
                                                        <b>{action.title}</b>: {action.status}
                                                    </li>
                                                )
                                            }
                                            return null
                                        })
                                    }
                                </ul>
                                <p>
                                    The message hasn't been sent, you should review it right now.
                                </p>
                                <div className="buttons">
                                    <button
                                        className="ui tiny button green"
                                        onClick={() => browserHistory.push(`/app/ticket/${resp.ticket_id}`)}
                                    >
                                        Review message
                                    </button>
                                </div>
                            </div>
                        )
                    }))
                } else if (hasPending) {
                    setTimeout(() => dispatch(fetchTicketMessage(ticketId, messageId)), 2000)
                } else {
                    dispatch(notify({
                        type: 'success',
                        message: 'Message successfully sent!'
                    }))
                }

                dispatch({
                    type: types.FETCH_MESSAGE_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_MESSAGE_ERROR,
                    error,
                    reason: 'Failed to fetch message. Please try again...'
                })
            })
    }
}

export function formatAction(action, template, context) {
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

    let newArgs = Map()

    action.get('arguments').forEach((value, key) => {
        if (template.getIn(['arguments', key, 'type']) === 'listDict') {
            newArgs = newArgs.set(key, Map({}))
            value.forEach(element => {
                newArgs = newArgs.setIn(
                    [key, renderTemplate(element.get('key'), context)],
                    renderTemplate(element.get('value'), context)
                )
            })
        } else {
            newArgs = newArgs.set(key, value)
        }
    })

    return action.set('arguments', newArgs).set('status', template.get('execution') === 'back' ? 'pending' : 'success')
}

/**
 * Return a user's most appropriate address to send a message.
 *
 * @param ticketChannel: the channel of the current ticket
 * @param user: the user from which we want the address
 * @returns {string} the address of the user
 */
function getAddress(ticketChannel, user) {
    let res = null

    if (user.channels) {
        for (const channel of user.channels) {
            if (channel.type === ticketChannel) {
                if (channel.preferred) {
                    return channel.address
                }

                res = channel.address
            }
        }
    }

    if (!res && ticketChannel === 'email') {
        res = user.email
    }

    return res
}

export function keyIn(...keys) {
    const keySet = Set(keys)
    return (v, k) => keySet.has(k)
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
        if (data.messages.length) {
            const msg = lastMessage(data.messages)

            if (data.newMessage.source.type === msg.source.type) {
                data.newMessage.source.from = msg.from_agent ? msg.source.from : msg.source.to[0]
            } else {
                data.newMessage.source.from = {name: currentUser.get('name')}

                const addr = currentUser.get(USER_VALUE_PROP[data.newMessage.source.type])

                if (addr) {
                    data.newMessage.source.from[SOURCE_VALUE_PROP[data.newMessage.source.type]] = addr
                }
            }
        } else {
            data.newMessage.source.from = {
                name: currentUser.get('name'),
                address: getAddress(data.channel, currentUser.toJS())
            }
        }

        // i.e. if we're creating a new ticket
        if (!data.messages.length) {
            data.channel = data.newMessage.channel
        }

        if (!data.newMessage.sender) {
            data.newMessage.sender = currentUser.filter(keyIn('email', 'id', 'name'))
        }

        // Facebook does not accept comment with just an attachment.
        if ((data.newMessage.body_text.length === 0) && (data.newMessage.attachments.length > 0)) {
            dispatch(notify({
                type: 'error',
                title: 'Your message cannot be sent',
                message: 'You cannot send an attachment without a message in a Facebook comment.'
            }))
            return null
        }

        if ((data.newMessage.body_text.length > 0) || (data.newMessage.attachments.length > 0)) {
            if (macroActions) {
                data.newMessage.actions = macroActions.map(curAction => formatAction(
                    curAction,
                    Immutable.fromJS(ACTION_TEMPLATES).get(curAction.get('name')),
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
function onMessageSent(dispatch, ticket_id, messageSent) {
    if (messageSent.actions) {
        setTimeout(() => dispatch(fetchTicketMessage(ticket_id, messageSent.id)), 1000)
    } else {
        dispatch(notify({
            type: 'success',
            message: 'Message successfully sent!'
        }))
    }

    // reinitialize the current macro
    dispatch({
        type: APPLY_MACRO,
        macro: undefined
    })
}

/**
 * @param ticket: A ticket with an existing id is expected.
 * @param action: A parameter to decide on what to do when an action failed. (Retry/ignore/cancel, etc.)
 */
export function submitTicketMessage(ticket, status, macroActions, currentUser, action, resetMessage = true) {
    return (dispatch) => {
        dispatch({
            type: types.SUBMIT_TICKET_MESSAGE_START,
            currentUser
        })

        const data = prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser)

        if (!data || _.isNull(data)) {
            return dispatch({
                type: types.SUBMIT_TICKET_MESSAGE_ERROR,
                reason: 'Message was not sent. Sent data is invalid.'
            })
        }

        const messageToSend = lastMessage(data.messages)

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
                // Update on the ticket.
                if (status) {
                    // We don't want to update the wrong state if we are redirecting so we specify the id in setStatus.
                    dispatch(setStatus(status, ticket.get('id')))
                    // We need to explicitely do the partial update because we cannot count on the component
                    // re-rendering (if we redirect). The re-rendering is when the autosave is usually performed and
                    // the status updated in db.
                    ticketPartialUpdate(ticket.get('id'), {status})(dispatch)
                }

                onMessageSent(dispatch, ticket.get('id'), resp, types.SUBMIT_TICKET_MESSAGE_SUCCESS)

                dispatch({
                    type: types.SUBMIT_TICKET_MESSAGE_SUCCESS,
                    resetMessage,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.SUBMIT_TICKET_MESSAGE_ERROR,
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
                const messageSent = lastMessage(resp.messages)

                onMessageSent(dispatch, resp.id, messageSent)

                dispatch({
                    type: types.SUBMIT_TICKET_SUCCESS,
                    resetMessage,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.SUBMIT_TICKET_ERROR,
                    error,
                    reason: 'Ticket was not created. Please try again in a few moments. If the problem persists contact us'
                })
            })
    }
}

export function clearTicket() {
    return {
        type: types.CLEAR_TICKET
    }
}

export function fetchUserTickets(userId) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_USER_TICKETS_START
        })

        return axios.get(`/api/users/${userId}/tickets/?type=requested`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_USER_TICKETS_SUCCESS,
                    userId,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_USER_TICKETS_ERROR,
                    error,
                    reason: 'Couldn\'t fetch user\'s tickets. Please try again in a few minutes.'
                })
            })
    }
}

export function fetchUserEvents(userId) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_USER_EVENTS_START
        })

        return axios.get(`/api/users/${userId}/events/`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_USER_EVENTS_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_USER_EVENTS_ERROR,
                    error,
                    reason: 'Couldn\'t fetch user\'s events. Please try again in a few minutes.'
                })
            })
    }
}

export function toggleHistory(state) {
    return {
        type: types.TOGGLE_HISTORY,
        state
    }
}

export function setCrossTickets(state = {}) {
    return {
        type: types.SET_CROSS_TICKETS,
        state
    }
}
