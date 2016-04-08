import reqwest from 'reqwest'
import { List } from 'immutable'
import _ from 'lodash'
import { systemMessage } from './systemMessage'
import { PER_PAGE } from '../constants'
import { ASTToAlgoliaSearchParams, ticketsIndex } from '../filters/algolia'


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

// Macro actions
// TODO: These are lowerCamelCase on the backend. Perhaps make them CONSISTENT?
export const SET_RESPONSE_TEXT = 'setResponseText'
export const ADD_TAGS = 'addTags'

export const SEARCH = 'search'

// export const ADD_TAGS = 'addTags'
export const ADD_TICKET_TAGS = 'addTags'
export const REMOVE_TICKET_TAG = 'REMOVE_TAG'
export const UPDATE_TICKET_TAGS = 'UPDATE_TAGS'

export const TOGGLE_PRIORITY = 'TOGGLE_PRIORITY'

export const SET_AGENT = 'SET_AGENT'
export const SET_STATUS = 'SET_STATUS'

export const MACRO_ACTIONS = [
    SET_RESPONSE_TEXT, ADD_TICKET_TAGS
]

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

export function updateTags(tags) {
    return {
        type: UPDATE_TICKET_TAGS,
        args: tags
    }
}

export function togglePriority() {
    return {
        type: TOGGLE_PRIORITY
    }
}

export function setAgent(agent) {
    return {
        type: SET_AGENT,
        agent
    }
}

export function setStatus(status) {
    return {
        type: SET_STATUS,
        status
    }
}

export function setResponseText(currentUser, text) {
    return {
        type: SET_RESPONSE_TEXT,
        args: List([text]),
        currentUser
    }
}

export function fetchPageFromAlgolia(settings, view, page, searchValue) {
    // We are 1-indexed, Algolia is 0-indexed
    page = page - 1

    const defaults = {
        page,
        hitsPerPage: PER_PAGE
    }

    if (!view) { return }

    const searchParams = ASTToAlgoliaSearchParams(view.get('filters_ast').toJS(), 'ticket.')
    const params = _.defaults(defaults, searchParams)

    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_LIST_VIEW_START,
        })

        return settings.getIn(['indices', 'ticket']).search(searchValue, params, (err, content) => {
            if (err) {
                return dispatch(systemMessage({
                    type: 'error',
                    header: 'Error: Failed to fetch list of tickets.',
                    msg: err
                }))
            }
            dispatch({
                type: FETCH_TICKET_LIST_VIEW_SUCCESS,
                resp: {
                    data: content.hits,
                    meta: {
                        nb_pages: content.nbPages,
                        page: content.page + 1
                    }
                }
            })
        })
    }
}

export function fetchView(url, data = {}, type = 'list') {
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_TICKET_LIST_VIEW_START : FETCH_TICKET_START,
        })

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
                type: type === 'list' ? FETCH_TICKET_LIST_VIEW_SUCCESS : FETCH_TICKET_SUCCESS,
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
            }

            delete data.newMessage
        }

        return reqwest({
            url: `/api/tickets/${ticket.get('id')}/`,
            type: 'json',
            contentType: 'application/json',
            method: 'PUT',
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

export function search(searchValue) {
    return {
        type: SEARCH,
        searchValue
    }
}
