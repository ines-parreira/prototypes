import axios from 'axios'
import {systemMessage} from '../systemMessage/actions'
import * as types from './constants'

export function fetchTicketsPage(page) {
    return (dispatch, getState) => {
        const state = getState()
        const views = state.views

        const activeView = views.get('active')

        if (!activeView || activeView.isEmpty()) {
            return Promise.resolve()
        }

        dispatch({
            type: types.FETCH_TICKET_LIST_VIEW_START,
            viewId: activeView.get('id')
        })

        let promise

        // when a view is dirty, just send the whole view data rather than just the id
        // this will allow us to test a view before submitting it to the DB
        if (views.getIn(['active', 'dirty'])) {
            promise = axios.put('/api/tickets/view/', {
                view: activeView.delete('dirty').delete('editMode').toJS(),
                page
            })
        } else {
            promise = axios.get('/api/tickets/', {
                params: {
                    view_id: activeView.get('id'),
                    page
                }
            })
        }

        return promise
            .then((json = {}) => json.data)
            .then(data => {
                dispatch({
                    type: types.FETCH_TICKET_LIST_VIEW_SUCCESS,
                    data,
                    viewId: activeView.get('id')
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_TICKET_LIST_VIEW_ERROR,
                    error,
                    reason: 'Failed to fetch list of tickets'
                })
            })
    }
}

export function toggleTicketSelection(ticketId) {
    return {
        type: types.TOGGLE_TICKET_SELECTION,
        ticketId
    }
}

export function bulkUpdate(ids, key, value) {
    return (dispatch) => {
        const data = {ids: ids.toJS(), updates: {}}
        data.updates[key] = value

        let successMessage = `${ids.size} tickets' ${key} successfully set to ${value}!`

        switch (key) {
            case 'tag':
                successMessage = `${ids.size} tickets have been tagged "${value.name}'.`
                break
            case 'status':
                successMessage = `${ids.size} tickets have been marked as ${value}.`
                break
            case 'assignee_user':
                successMessage = `${ids.size} tickets have been assigned to ${value.name}!`
                break
            case 'priority':
                successMessage = `${ids.size} tickets have been marked as ${value} priority.`
                break
            case 'macro':
                successMessage = `Macro successfully applied to ${ids.size} tickets.`

                for (const action of value.actions) {
                    switch (action.name) {
                        case 'setStatus':
                            data.updates.status = action.arguments.status
                            break
                        case 'setPriority':
                            data.updates.priority = action.arguments.priority
                            break
                        case 'addTags':
                            data.updates.tags = action.arguments
                            break
                        case 'setAssignee':
                            data.updates.assignee_user = action.arguments.assignee_user
                            break
                        default:
                            break
                    }
                }
                break
            default:
                break
        }

        dispatch({
            type: types.BULK_UPDATE_START
        })

        dispatch(systemMessage({
            type: 'loading',
            msg: 'Updating tickets...'
        }))

        return axios.put('/api/tickets/', data)
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.BULK_UPDATE_SUCCESS,
                    updates: data.updates
                })

                setTimeout(() => dispatch(fetchTicketsPage(1)), 800)

                dispatch(systemMessage({
                    type: 'success',
                    msg: successMessage
                }))
            })
            .catch(error => {
                dispatch({
                    type: types.BULK_UPDATE_ERROR,
                    error,
                    reason: 'Failed to update list of tickets'
                })
            })
    }
}

export function bulkDelete(ids) {
    return (dispatch) => {
        dispatch({
            type: types.BULK_DELETE_START
        })

        dispatch(systemMessage({
            type: 'loading',
            msg: 'Deleting tickets...'
        }))

        return axios.delete('/api/tickets/', {
            data: {ids}
        })
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.BULK_DELETE_SUCCESS,
                    ids
                })

                dispatch(systemMessage({
                    type: 'success',
                    msg: `${ids.size} tickets successfully deleted!`
                }))
            })
            .catch(error => {
                dispatch({
                    type: types.BULK_DELETE_ERROR,
                    error,
                    reason: 'Couldn\'t delete selected tickets'
                })
            })
    }
}


export function bulkApplyMacro(macroId) {
    return {
        type: types.BULK_APPLY_MACRO,
        macroId
    }
}


export function saveIndex(currentTicketIndex) {
    return {
        type: types.SAVE_INDEX,
        currentTicketIndex
    }
}
