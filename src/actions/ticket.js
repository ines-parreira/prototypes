import reqwest from 'reqwest'
import {systemMessage} from './systemMessage'

// Basic operations on the ticket
export const NEW_TICKET = 'NEW_TICKET'
export const CLOSE_TICKET = 'CLOSE_TICKET'
export const OPEN_TICKET = 'OPEN_TICKET'

// Reply to a ticket
export const REPLY_TICKET_START = 'REPLY_TICKET_START'
export const REPLY_TICKET_SUCCESS = 'REPLY_TICKET_SUCCESS'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_SUCCESS = 'FETCH_TICKET_SUCCESS'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'

export function fetchView(url, type = 'list') {
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_TICKET_LIST_VIEW_START : FETCH_TICKET_START
        })

        return reqwest({
            url: url,
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

export function sendReply(ticket) {
    return (dispatch) => {
        // we mark that we're trying to send the reply (used in the UI to show progress)
        dispatch({
            type: REPLY_TICKET_START
        })

        return reqwest({
            url: `/tickets/${ticket.get('id')}/`,
            type: 'json',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(ticket.toJS())
        }).then((resp) => {
            dispatch({
                type: REPLY_TICKET_SUCCESS,
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
