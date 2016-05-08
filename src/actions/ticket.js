import reqwest from 'reqwest'
import {Map} from 'immutable'
import _ from 'lodash'
import {systemMessage} from './systemMessage'


// Basic operations on the ticket
export const NEW_TICKET = 'NEW_TICKET'
export const CLOSE_TICKET = 'CLOSE_TICKET'
export const OPEN_TICKET = 'OPEN_TICKET'

// Reply to a ticket
export const SUBMIT_TICKET_START = 'SUBMIT_TICKET_START'
export const SUBMIT_TICKET_SUCCESS = 'SUBMIT_TICKET_SUCCESS'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'

export const SORT_TICKETS = 'SORT_TICKETS'

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

export function setReceiver(receiverId, receiverAttr, channel) {
    return {
        type: SET_RECEIVER,
        receiverId,
        receiverAttr,
        channel
    }
}

export function updatePotentialRequesters(potentialRequesters, query) {
    return {
        type: UPDATE_POTENTIAL_REQUESTERS,
        potentialRequesters,
        query
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

export function fetchTicketsPage(view, page) {
    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_LIST_VIEW_START
        })

        const url = '/api/tickets/'

        return reqwest({
            url,
            data: {
                view,
                page
            },
            type: 'json',
            method: 'GET',
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

export function search(props, query) {
    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_LIST_VIEW_START
        })

        return reqwest({
            url: '/api/search/',
            data: JSON.stringify({
                doc_type: 'ticket',
                fields: props.fields,
                query
            }),
            type: 'json',
            method: 'POST',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_TICKET_LIST_VIEW_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to search tickets. Please try again..',
                msg: err
            }))
        })
    }
}

export function submitTicket(ticket, status) {
    return (dispatch) => {
        // we mark that we're trying to send the reply (used in the UI to show progress)
        dispatch({
            type: SUBMIT_TICKET_START
        })
        // Allow the user to trigger "Close & Send" with just one action
        const data = ticket.toJS()

        data.status = status || data.status

        if (data.newMessage) {
            if (data.newMessage.body_text.length > 0) {
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
            url: ticket.get('id') ? `/api/tickets/${ticket.get('id')}/` : '/api/tickets/',
            type: 'json',
            contentType: 'application/json',
            method: ticket.get('id') ? 'PUT' : 'POST',
            data: JSON.stringify(data)
        }).then((resp) => {
            dispatch({
                type: SUBMIT_TICKET_SUCCESS,
                resp
            })
        }).catch((err) => {
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

export function sort(sortProperty) {
    return {
        type: SORT_TICKETS,
        sortProperty
    }
}
