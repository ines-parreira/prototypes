import reqwest from 'reqwest'
import { systemMessage } from './systemMessage'
import { PER_PAGE } from '../constants'

// Basic operations on the ticket
export const NEW_TICKET = 'NEW_TICKET'
export const CLOSE_TICKET = 'CLOSE_TICKET'
export const OPEN_TICKET = 'OPEN_TICKET'

// Given some changes in the UI, update ticket properties to be reflected in the UI and prepared for submission
export const UPDATE_TICKET_PROPS = 'UPDATE_TICKET_PROPS'

// Reply to a ticket
export const SUBMIT_TICKET_START = 'SUBMIT_TICKET_START'
export const SUBMIT_TICKET_SUCCESS = 'SUBMIT_TICKET_SUCCESS'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'


export function fetchPage(view, page, data = {}) {
    const defaults = {
        view: view.slug,
        page: page,
        per_page: PER_PAGE,
    }
    return fetchView("/api/tickets/", _.defaults(defaults, data))
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

export function updateTicket(props) {
    return {
        type: UPDATE_TICKET_PROPS,
        props
    }
}

export function submitTicket(ticket) {
    return (dispatch) => {
        // we mark that we're trying to send the reply (used in the UI to show progress)
        dispatch({
            type: SUBMIT_TICKET_START
        })

        return reqwest({
            url: `/api/tickets/${ticket.get('id')}/`,
            type: 'json',
            contentType: 'application/json',
            method: 'PUT',
            data: JSON.stringify(ticket.toJS())
        }).then((resp) => {
            dispatch({
                type: SUBMIT_TICKET_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Message was not sent',
                msg: `Please try again in a few moments. If the problem persists contact us.`
            }))
        })
    }
}
