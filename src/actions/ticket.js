import reqwest from 'reqwest'

// Basic operations on the ticket
export const NEW_TICKET = 'NEW_TICKET'
export const CLOSE_TICKET = 'CLOSE_TICKET'
export const OPEN_TICKET = 'OPEN_TICKET'
export const REPLY_TICKET = 'REPLY_TICKET'

// Fetching a single ticket life-cycle
export const FETCH_TICKET_START = 'FETCH_TICKET_START'
export const FETCH_TICKET_FINISH = 'FETCH_TICKET_FINISH'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_FINISH = 'FETCH_TICKET_LIST_VIEW_FINISH'

export function fetchView(url) {
    return (dispatch) => {
        dispatch({
            type: FETCH_TICKET_LIST_VIEW_START
        })

        return reqwest({
            url: url,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_TICKET_LIST_VIEW_FINISH,
                resp
            })
        })
    }
}
