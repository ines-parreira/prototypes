import reqwest from 'reqwest'
import _ from 'lodash'
import {systemMessage} from './systemMessage'

// Fetching a list of tickets life-cycle
export const FETCH_TICKET_LIST_VIEW_START = 'FETCH_TICKET_LIST_VIEW_START'
export const FETCH_TICKET_LIST_VIEW_SUCCESS = 'FETCH_TICKET_LIST_VIEW_SUCCESS'

export const TOGGLE_TICKET_SELECTION = 'TOGGLE_TICKET_SELECTION'

export const BULK_UPDATE_START = 'BULK_UPDATE_START'
export const BULK_UPDATE_SUCCESS = 'BULK_UPDATE_SUCCESS'

export const BULK_DELETE_START = 'BULK_DELETE_START'
export const BULK_DELETE_SUCCESS = 'BULK_DELETE_SUCCESS'

export const BULK_APPLY_MACRO = 'BULK_APPLY_MACRO'

export const SAVE_INDEX = 'SAVE_INDEX'


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


export function toggleTicketSelection(ticketId) {
    return {
        type: TOGGLE_TICKET_SELECTION,
        ticketId
    }
}


export function bulkUpdate(ids, key, value) {
    return (dispatch) => {
        dispatch({
            type: BULK_UPDATE_START
        })
        dispatch(systemMessage({
            type: 'loading',
            msg: 'Updating tickets...'
        }))

        const data = { ids: ids.toJS(), updates: {} }
        data.updates[key] = value

        let msg = `${ids.size} tickets' ${key} successfully set to ${value}!`

        switch (key) {
            case 'tag':
                msg = `${ids.size} tickets successfully tagged ${value.name}!`
                break
            case 'assignee_user':
                msg = `${ids.size} tickets successfully assigned to ${value.name}!`
                break;
            default:
                break;
        }


        return reqwest({
            url: '/api/tickets/',
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: BULK_UPDATE_SUCCESS,
                key,
                value,
                resp
            })
            dispatch(systemMessage({
                type: 'success',
                msg
            }))
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to update list of tickets',
                msg: err
            }))
        })
    }
}


export function bulkDelete(ids) {
    return (dispatch) => {
        dispatch({
            type: BULK_DELETE_START
        })
        dispatch(systemMessage({
            type: 'loading',
            msg: 'Deleting tickets...'
        }))

        return reqwest({
            url: '/api/tickets/',
            method: 'DELETE',
            data: JSON.stringify({ ids }),
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: BULK_DELETE_SUCCESS,
                ids,
                resp
            })
            dispatch(systemMessage({
                type: 'success',
                msg: `${ids.size} tickets successfully deleted!`
            }))
        }).catch((err) => {
            dispatch({
                type: 'error',
                header: 'Error: couldn\'t delete selected tickets.',
                msg: err
            })
        })
    }
}


export function bulkApplyMacro(macroId) {
    return {
        type: BULK_APPLY_MACRO,
        macroId
    }
}


export function saveIndex(currentTicketIndex) {
    return {
        type: SAVE_INDEX,
        currentTicketIndex
    }
}
