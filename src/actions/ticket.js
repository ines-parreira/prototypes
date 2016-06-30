import reqwest from 'reqwest'
import React from 'react'
import _ from 'lodash'
import {browserHistory} from 'react-router'
import Immutable, {Map, Set} from 'immutable'

import {systemMessage} from './systemMessage'
import {ACTION_TEMPLATES} from './../constants'
import {renderTemplate} from '../components/utils/template'
import {lastMessage} from '../utils'
import * as MacroActions from './macro'

// Reply to a ticket
export const SUBMIT_TICKET_START = 'SUBMIT_TICKET_START'
export const SUBMIT_TICKET_SUCCESS = 'SUBMIT_TICKET_SUCCESS'
export const SUBMIT_TICKET_MESSAGE_SUCCESS = 'SUBMIT_TICKET_MESSAGE_SUCCESS'
export const SUBMIT_TICKET_MESSAGE_START = 'SUBMIT_TICKET_MESSAGE_START'
export const SUBMIT_TICKET_MESSAGE_ERROR = 'SUBMIT_TICKET_MESSAGE_ERROR'
export const SUBMIT_TICKET_ERROR = 'SUBMIT_TICKET_ERROR'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'

export const CLEAR_TICKET = 'CLEAR_TICKET'

// Fetching a single ticketMessage to get action results
export const FETCH_MESSAGE_START = 'FETCH_MESSAGE_START'
export const FETCH_MESSAGE_SUCCESS = 'FETCH_MESSAGE_SUCCESS'

export const TICKET_PARTIAL_UPDATE_START = 'TICKET_PARTIAL_UPDATE_START'
export const TICKET_PARTIAL_UPDATE_SUCCESS = 'TICKET_PARTIAL_UPDATE_SUCCESS'

// Macro actions
export const ADD_TICKET_TAGS = 'addTags'
export const TOGGLE_PRIORITY = 'setPriority'
export const SET_RESPONSE_TEXT = 'setResponseText'
export const SET_STATUS = 'setStatus'
export const SET_AGENT = 'assignUser'

export const SET_TAGS = 'SET_TAGS'

export const REMOVE_TICKET_TAG = 'REMOVE_TAG'

export const RECORD_MACRO = 'RECORD_MACRO'

export const SET_PUBLIC = 'SET_PUBLIC'
export const SET_SUBJECT = 'SET_SUBJECT'
export const ADD_RECEIVER = 'ADD_RECEIVER'
export const REMOVE_RECEIVER = 'REMOVE_RECEIVER'
export const SET_SOURCE_TYPE = 'SET_SOURCE_TYPE'

export const SETUP_NEW_TICKET = 'SETUP_NEW_TICKET'

export const UPDATE_POTENTIAL_REQUESTERS = 'UPDATE_POTENTIAL_REQUESTERS'
export const MARK_TICKET_DIRTY = 'MARK_TICKET_DIRTY'

export const DELETE_TICKET_MESSAGE_START = 'DELETE_TICKET_MESSAGE_START'
export const DELETE_TICKET_MESSAGE_SUCCESS = 'DELETE_TICKET_MESSAGE_SUCCESS'

// Action related to attachments
export const ADD_ATTACHMENT_START = 'ADD_ATTACHMENT_START'
export const ADD_ATTACHMENT_SUCCESS = 'ADD_ATTACHMENT_SUCCESS'
export const DELETE_ATTACHMENT = 'DELETE_ATTACHMENT'

export function addAttachments(attachments) {
    return (dispatch) => {
        dispatch({
            type: ADD_ATTACHMENT_START
        })

        const formData = new window.FormData()

        for (const attachment of attachments) {
            formData.append(attachment.name, attachment.file)
        }

        return reqwest({
            url: '/api/upload/',
            method: 'POST',
            crossOrigin: true,
            processData: false,
            data: formData
        }).then((resp) => {
            dispatch({
                type: ADD_ATTACHMENT_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to upload files. Please try again later.',
                msg: err
            }))
        })
    }
}

export function deleteAttachment(index) {
    return {
        type: DELETE_ATTACHMENT,
        index
    }
}

export function recordMacro(macro) {
    return {
        type: RECORD_MACRO,
        macro
    }
}

export function ticketPartialUpdate(ticketId, args) {
    return (dispatch) => {
        dispatch({
            type: TICKET_PARTIAL_UPDATE_START
        })

        return reqwest({
            method: 'PUT',
            url: `/api/tickets/${ticketId}/`,
            data: JSON.stringify(args),
            type: 'json',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: TICKET_PARTIAL_UPDATE_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: 'error',
                header: `Error: failed to update ticket ${ticketId}`,
                msg: err
            })
        })
    }
}

export function addTags(tags) {
    return {
        type: ADD_TICKET_TAGS,
        args: tags
    }
}

export function removeTag(index) {
    return {
        type: REMOVE_TICKET_TAG,
        index
    }
}

export function togglePriority(priority) { // here, the priority argument is optional
    return {
        type: TOGGLE_PRIORITY,
        args: Map({
            priority: priority.isString ? priority : null
        })
    }
}

/* eslint "camelcase": "off" */
export function setAgent(assignee_user) {
    return {
        type: SET_AGENT,
        args: Map({
            assignee_user
        })
    }
}

export function setStatus(status) {
    return {
        type: SET_STATUS,
        args: Map({
            status
        })
    }
}

export function setPublic(isPublic) {
    return {
        type: SET_PUBLIC,
        isPublic
    }
}

export function setSubject(subject) {
    return {
        type: SET_SUBJECT,
        args: Map({
            subject
        })
    }
}

export function addReceiver(receiver) {
    return {
        type: ADD_RECEIVER,
        receiver
    }
}

export function removeReceiver(prop) {
    return {
        type: REMOVE_RECEIVER,
        prop
    }
}

export function setSourceType(sourceType) {
    return {
        type: SET_SOURCE_TYPE,
        sourceType
    }
}

export function updatePotentialRequesters(query) {
    return (dispatch) => reqwest({
        url: '/api/search/',
        data: JSON.stringify({
            doc_type: 'user_channel',
            query
        }),
        type: 'json',
        method: 'POST',
        contentType: 'application/json'
    }).then(resp => {
        dispatch({
            type: UPDATE_POTENTIAL_REQUESTERS,
            resp,
            query
        })
    }).catch((err) => {
        dispatch(systemMessage({
            type: 'error',
            header: 'Error: failed to do the search. Please try again..',
            msg: err
        }))
    })
}

export function setResponseText(currentUser, args) {
    return {
        type: SET_RESPONSE_TEXT,
        args,
        currentUser
    }
}

export function markTicketDirty() {
    return {
        type: MARK_TICKET_DIRTY
    }
}

export function setupNewTicket() {
    return {
        type: SETUP_NEW_TICKET
    }
}

export function deleteMessage(ticketId, messageId) {
    return (dispatch) => {
        dispatch({
            type: DELETE_TICKET_MESSAGE_START
        })

        const url = `/api/tickets/${ticketId}/messages/${messageId}/`

        return reqwest({
            url,
            type: 'json',
            method: 'DELETE',
            contentType: 'application/json'
        }).then(() => {
            dispatch({
                type: DELETE_TICKET_MESSAGE_SUCCESS,
                messageId
            })
        }).catch((err) => {
            dispatch({
                type: 'error',
                header: `Error: failed to deleted message ${messageId} from ticket ${ticketId}`,
                msg: err
            })
        })
    }
}

export function fetchTicketDetails(ticketId, data) {
    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_START
        })

        const url = `/api/tickets/${ticketId}/`

        return reqwest({
            url,
            data,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            if (_.isEmpty(resp)) {
                console.error('No results for', url)
            }
            dispatch({
                type: FETCH_TICKET_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: `Error: Failed to fetch ticket ${ticketId}`,
                msg: err
            }))
        })
    }
}

export function fetchTicketMessage(ticketId, messageId) {
    return (dispatch) => {
        dispatch({
            type: FETCH_MESSAGE_START
        })

        return reqwest({
            url: `/api/tickets/${ticketId}/messages/${messageId}/`,
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            const hasFailure = resp.actions.find(action => action.status === 'error')
            const hasPending = resp.actions.find(action => action.status === 'pending')

            if (hasFailure) {
                dispatch(systemMessage({
                    type: 'error',
                    header: 'Something went wrong :/',
                    modal: true,
                    options: {
                        title: 'Oops! Some actions failed on your last message:',
                        actions: [
                            {
                                onClick: () => browserHistory.push(`/app/ticket/${resp.ticket_id}`),
                                className: 'ui green button',
                                msg: 'Review message'
                            }
                        ]
                    },
                    msg: (
                        <div>
                            <ul>
                                {
                                    resp.actions.map((action, idx) => {
                                        if (ACTION_TEMPLATES[action.name].execution === 'back') {
                                            return <li key={idx}>{action.title}: {action.status}</li>
                                        }
                                        return null
                                    })
                                }
                            </ul>
                            <p>
                                The message hasn't been sent, you should review it right now.
                            </p>
                        </div>
                    )
                }))
            } else if (hasPending) {
                setTimeout(() => dispatch(fetchTicketMessage(ticketId, messageId)), 2000)
            } else {
                dispatch(systemMessage({
                    type: 'success',
                    msg: 'Message successfully sent!'
                }))
            }

            dispatch({
                type: FETCH_MESSAGE_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch message. Please try again..',
                msg: err
            }))
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

    action.get('arguments').map((value, key) => {
        if (template.getIn(['arguments', key, 'type']) === 'listDict') {
            newArgs = newArgs.set(key, Map({}))
            value.map(element => {
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
            data.newMessage.source.from = msg.from_agent ? msg.source.from : msg.source.to[0]
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

        if (data.newMessage.body_text.length > 0) {
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
            dispatch(systemMessage({
                type: 'error',
                header: 'You need to write a message.',
                msg: 'You can\'t create a new ticket without at least a message.'
            }))
            return null
        }

        delete data.newMessage
    }

    delete data.state
    return data
}

/**
 * Perform actions when we successfully create a new message.
 */
function onMessageSent(dispatch, ticket_id, messageSent) {
    if (messageSent.actions) {
        setTimeout(() => dispatch(fetchTicketMessage(ticket_id, messageSent.id)), 1000)
    } else {
        dispatch(systemMessage({
            type: 'success',
            msg: 'Message successfully sent!'
        }))
    }

    // reinitialize the current macro
    dispatch({
        type: MacroActions.APPLY_MACRO,
        macro: undefined
    })
}

/**
 *
 * @param ticket: A ticket with an existing id is expected.
 * @param action: A parameter to decide on what to do when an action failed. (Retry/ignore/cancel, etc.)
 */
export function submitTicketMessage(ticket, status, macroActions, currentUser, action, resetMessage = true) {
    return (dispatch) => {
        dispatch({
            type: SUBMIT_TICKET_MESSAGE_START
        })
        const data = prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser)

        const messageToSend = lastMessage(data.messages)

        let url = `/api/tickets/${ticket.get('id')}/messages/`
        let method = 'POST'
        if (action) {
            // In that case the message already exists and we just want to update the actions on it.
            url = `/api/tickets/${ticket.get('id')}/messages/${messageToSend.id}/${action ? `?action=${action}` : ''}`
            method = 'PUT'
        }

        return reqwest({
            url,
            type: 'json',
            contentType: 'application/json',
            method,
            data: JSON.stringify(messageToSend)
        }).then((resp) => {
            onMessageSent(dispatch, ticket.get('id'), resp, SUBMIT_TICKET_MESSAGE_SUCCESS)
            dispatch({
                type: SUBMIT_TICKET_MESSAGE_SUCCESS,
                resetMessage,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: SUBMIT_TICKET_MESSAGE_ERROR
            })
            dispatch(systemMessage({
                type: 'error',
                err,
                header: 'Error: Message was not sent',
                msg: 'Please try again in a few moments. If the problem persists contact us.'
            }))
        })
    }
}

export function submitTicket(ticket, status, macroActions, currentUser, action, resetMessage = true) {
    return (dispatch) => {
        dispatch({
            type: SUBMIT_TICKET_START
        })

        const data = prepareTicketDataToSend(dispatch, ticket, status, macroActions, currentUser)

        return reqwest({
            url: '/api/tickets/',
            type: 'json',
            contentType: 'application/json',
            method: 'POST',
            data: JSON.stringify(data)
        }).then((resp) => {
            const messageSent = lastMessage(resp.messages)
            onMessageSent(dispatch, resp.id, messageSent)
            dispatch({
                type: SUBMIT_TICKET_SUCCESS,
                resetMessage,
                resp
            })
        }).catch((err) => {
            dispatch({
                type: SUBMIT_TICKET_ERROR
            })
            dispatch(systemMessage({
                type: 'error',
                err,
                header: 'Error: Message was not sent',
                msg: 'Please try again in a few moments. If the problem persists contact us.'
            }))
        })
    }
}

export function clearTicket() {
    return {
        type: CLEAR_TICKET
    }
}
