import reqwest from 'reqwest'
import {systemMessage} from './systemMessage'

export const DEFAULT_VIEW = 'my-tickets'

// Basic operations on the views
export const UPDATE_VIEW = 'UPDATE_VIEW'
export const RESET_VIEW = 'RESET_VIEW'
export const UPDATE_VIEW_FIELD = 'UPDATE_VIEW_FIELD'
export const UPDATE_VIEW_FIELD_FILTER = 'UPDATE_VIEW_FIELD_FILTER'
export const UPDATE_VIEW_FIELD_ENUM_START = 'UPDATE_VIEW_FIELD_ENUM_START'
export const UPDATE_VIEW_FIELD_ENUM_SUCCESS = 'UPDATE_VIEW_FIELD_ENUM_SUCCESS'

// Fetch individual view definitions
export const FETCH_VIEW_START = 'FETCH_VIEW_START'
export const FETCH_VIEW_SUCCESS = 'FETCH_VIEW_SUCCESS'

// Update individual view definitions
export const SUBMIT_VIEW_START = 'SUBMIT_VIEW_START'
export const SUBMIT_NEW_VIEW_SUCCESS = 'SUBMIT_NEW_VIEW_SUCCESS'
export const SUBMIT_UPDATE_VIEW_SUCCESS = 'SUBMIT_UPDATE_VIEW_SUCCESS'

// Fetch list views
export const FETCH_VIEW_LIST_START = 'FETCH_VIEW_LIST_START'
export const FETCH_VIEW_LIST_SUCCESS = 'FETCH_VIEW_LIST_SUCCESS'

// Read views
export const SET_VIEW_ACTIVE = 'SET_VIEW_ACTIVE'

export function setViewActive(view) {
    return {
        type: SET_VIEW_ACTIVE,
        view
    }
}

export function updateView(view) {
    return {
        type: UPDATE_VIEW,
        view
    }
}

export function updateField(field) {
    return {
        type: UPDATE_VIEW_FIELD,
        field
    }
}

// update a filter for 1 field
export function updateFieldFilter(field, filter) {
    return {
        type: UPDATE_VIEW_FIELD_FILTER,
        field,
        filter
    }
}

export function updateFieldEnumSearch(field, query) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_VIEW_FIELD_ENUM_START
        })

        return reqwest({
            url: '/api/search/',
            data: JSON.stringify({
                doc_type: field.getIn(['filter', 'doc_type']),
                query
            }),
            type: 'json',
            method: 'POST',
            contentType: 'application/json'
        }).then(resp => {
            dispatch({
                type: UPDATE_VIEW_FIELD_ENUM_SUCCESS,
                field,
                resp
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

export function resetView() {
    return {
        type: RESET_VIEW
    }
}

export function fetchViews(currentViewSlug) {
    const url = '/api/views/'
    const data = {type: 'ticket-list'}
    const type = 'list'
    return (dispatch) => {
        dispatch({
            type: type === 'list' ? FETCH_VIEW_LIST_START : FETCH_VIEW_START
        })

        return reqwest({
            url,
            data,
            type: 'json',
            method: 'GET',
            contentType: 'application/json',
        }).then((resp) => {
            dispatch({
                type: type === 'list' ? FETCH_VIEW_LIST_SUCCESS : FETCH_VIEW_SUCCESS,
                resp,
                currentViewSlug
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to fetch views.',
                msg: err
            }))
        })
    }
}

export function submitView(view) {
    let url = '/api/views/'
    let method = 'POST'

    if (view.get('id')) {
        url = `/api/views/${view.get('id')}/`
        method = 'PUT'
    }

    return (dispatch) => {
        dispatch({
            type: SUBMIT_VIEW_START
        })

        return reqwest({
            url,
            method,
            data: JSON.stringify(view.toJS()),
            type: 'json',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: view.get('id') ? SUBMIT_UPDATE_VIEW_SUCCESS : SUBMIT_NEW_VIEW_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to submit view. Please try again',
                msg: err
            }))
        })
    }
}

export function deleteView(view) {
    if (view.get('slug') === DEFAULT_VIEW) {
        return (dispatch) => dispatch(systemMessage({
            type: 'error',
            header: 'This view cannot be deleted.',
            msg: 'This is a special view that needs to exist in order for the helpdesk to function correctly.'
        }))
    }

    if (window.confirm('Are you sure you want to delete this view?')) {
        return (dispatch) => reqwest({
            url: `/api/views/${view.get('id')}/`,
            type: 'json',
            method: 'DELETE',
            contentType: 'application/json'
        }).then(() => {
            dispatch(fetchViews(DEFAULT_VIEW))
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: Failed to delete views.',
                msg: err
            }))
        })
    }
    return {
        type: 'NOOP' // action always needs a type
    }
}
