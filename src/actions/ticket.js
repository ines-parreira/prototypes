import reqwest from 'reqwest'
import React from 'react'
import {browserHistory} from 'react-router'
import Immutable, {Map} from 'immutable'
import _ from 'lodash'
import {systemMessage} from './systemMessage'
import {ACTION_TEMPLATES} from './../constants'
import {renderTemplate} from '../components/utils/template'
import * as MacroActions from './macro'

// Reply to a ticket
export const SUBMIT_TICKET_START = 'SUBMIT_TICKET_START'
export const SUBMIT_TICKET_SUCCESS = 'SUBMIT_TICKET_SUCCESS'
export const SUBMIT_TICKET_ERROR = 'SUBMIT_TICKET_ERROR'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'

// Fetching a single ticketMessage to get action results
export const FETCH_MESSAGE_START = 'FETCH_MESSAGE_START'
export const FETCH_MESSAGE_SUCCESS = 'FETCH_MESSAGE_SUCCESS'

// Macro actions
export const SET_RESPONSE_TEXT = 'setResponseText'
export const ADD_TICKET_TAGS = 'addTags'
export const SET_STATUS = 'setStatus'
export const SET_AGENT = 'assignUser'
export const TOGGLE_PRIORITY = 'setPriority'

export const RECORD_MACRO = 'RECORD_MACRO'

export const REMOVE_TICKET_TAG = 'REMOVE_TAG'

export const SET_PUBLIC = 'TOGGLE_PUBLIC'
export const SET_SUBJECT = 'SET_SUBJECT'
export const SET_RECEIVER = 'SET_RECEIVER'

export const SAVE_INDEX = 'SAVE_INDEX'

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
        subject
    }
}

export function setReceiver(receiver, channel) {
    return {
        type: SET_RECEIVER,
        receiver,
        channel
    }
}

export function updatePotentialRequesters(query) {
    return (dispatch) => {
        return reqwest({
            url: '/api/search/',
            data: JSON.stringify({
                doc_type: 'user',
                queryPath: 'query.multi_match.query',
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
}

export function setResponseText(currentUser, body_text, body_html) {
    return {
        type: SET_RESPONSE_TEXT,
        args: Map({
            body_text,
            body_html
        }),
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
            url: url,
            data: data,
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

export function fetchTicketsPage(views, page) {
    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_LIST_VIEW_START
        })


        let url = '/api/tickets/'
        let method = 'GET'
        let data = {
            view: views.get('active').get('slug'),
            page
        }

        // when a view is dirty, just send the whole view data rather than just the slug
        // this will allow us to test a view before submitting it to the DB
        if (views.get('dirty')) {
            url = '/api/tickets/view/'
            method = 'PUT'
            data = JSON.stringify({
                view: views.get('active').toJS(),
                page
            })
        }

        return reqwest({
            url,
            method,
            data,
            type: 'json',
            contentType: 'application/json'
        }).then((resp) => {
            if (_.isEmpty(resp)) {
                console.error('No results for', url)
            }
            dispatch({
                type: FETCH_TICKET_LIST_VIEW_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to fetch list of tickets.',
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
                    header: 'Oops! One or more actions failed on your last message. Here is the message status:',
                    msg: (
                        <div>
                            <ul>
                                {
                                    resp.actions.map((action, idx) => (
                                        <li key={idx}>{action.title}: {action.status}</li>
                                    ))
                                }
                            </ul>
                            <p>
                                The message hasn't been sent, you should
                                <a onClick={() => browserHistory.push(`/app/ticket/${resp.ticket_id}`)}>
                                    {" review it right now"}
                                </a>
                                .
                            </p>
                        </div>
                    )
                }))
            } else if (hasPending) {
                setTimeout(() => dispatch(fetchTicketMessage(ticketId, messageId)), 2000)
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

export function submitTicket(ticket, status, macroActions, currentUser, action) {
    return (dispatch) => {
        // we mark that we're trying to send the reply (used in the UI to show progress)
        dispatch({
            type: SUBMIT_TICKET_START
        })

        const data = ticket.toJS()
        data.status = status || data.status

        if (data.newMessage) {
            if (data.newMessage.body_text.length > 0) {
                if (macroActions) {
                    data.newMessage.actions = macroActions.map(curAction => formatAction(
                        curAction,
                        Immutable.fromJS(ACTION_TEMPLATES).get(curAction.get('name')),
                        {ticket: ticket.toJS(), currentUser: currentUser.toJS()}
                    ))
                }

                data.messages.push(data.newMessage)
            } else if (!data.messages.length) {
                dispatch(systemMessage({
                    type: 'error',
                    header: 'You need to write a message.',
                    msg: 'You can\'t create a new ticket without at least a message.'
                }))
                return
            }

            delete data.newMessage
        }

        if (data.assignee_user) {
            data.assignee_user = {id: data.assignee_user.id}
        }

        delete data.state

        return reqwest({
            url: ticket.get('id') ? `/api/tickets/${ticket.get('id')}/${action ? `?action=${action}` : ''}` : '/api/tickets/',
            type: 'json',
            contentType: 'application/json',
            method: ticket.get('id') ? 'PUT' : 'POST',
            data: JSON.stringify(data)
        }).then((resp) => {
            if (resp.last_message.actions) {
                setTimeout(() => dispatch(fetchTicketMessage(resp.id, resp.last_message.id)), 1000)
            }
            dispatch({
                type: SUBMIT_TICKET_SUCCESS,
                resp
            })
            dispatch({
                type: MacroActions.APPLY_MACRO,
                macro: undefined // reinitialize the current macro
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

export function saveIndex(currentTicketIndex) {
    return {
        type: SAVE_INDEX,
        currentTicketIndex
    }
}
