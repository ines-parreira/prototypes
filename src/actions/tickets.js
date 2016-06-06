import reqwest from 'reqwest'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'

export const TOGGLE_TICKET_SELECTION = 'TOGGLE_TICKET_SELECTION'
export const BULK_SET_STATUS = 'BULK_SET_STATUS'
export const BULK_ASSIGN = 'BULK_ASSIGN'
export const BULK_ADD_TAGS = 'BULK_ADD_TAGS'
export const BULK_APPLY_MACRO = 'BULK_APPLY_MACRO'
export const BULKD_SET_PRIORITY = 'BULK_SET_PRIORITY'
export const BULK_DELETE = 'BULK_DELETE'


export function toggleTicketSelection(ticketId) {
    return {
        type: TOGGLE_TICKET_SELECTION,
        ticketId
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
        if (views.getIn(['active', 'dirty'])) {
            url = '/api/tickets/view/'
            method = 'PUT'
            data = JSON.stringify({
                view: views.get('active').delete('dirty').toJS(),
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