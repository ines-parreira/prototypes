import axios from 'axios'
import {systemMessage} from '../systemMessage/actions'
import {DEFAULT_VIEW} from '../../config'
import * as types from './constants'

export const setViewActive = (view) => ({
    type: types.SET_VIEW_ACTIVE,
    view
})

export const updateView = (view) => ({
    type: types.UPDATE_VIEW,
    view
})

export const updateField = (field) => ({
    type: types.UPDATE_VIEW_FIELD,
    field
})

// add filter for 1 field
export const addFieldFilter = (field, filter) => ({
    type: types.ADD_VIEW_FIELD_FILTER,
    field,
    filter
})

// remove a filter based on index
export const removeFieldFilter = (index) => ({
    type: types.REMOVE_VIEW_FIELD_FILTER,
    index
})

// remove a filter based on index
export const updateFieldFilterOperator = (index, operator) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
    index,
    operator
})

export function updateFieldEnumSearch(field, query) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_VIEW_FIELD_ENUM_START
        })

        return axios.post('/api/search/', {
            doc_type: field.getIn(['filter', 'doc_type']),
            query
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_SUCCESS,
                    field,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.UPDATE_VIEW_FIELD_ENUM_ERROR,
                    error,
                    reason: 'Failed to select this filter'
                })
            })
    }
}

export const resetView = () => ({type: types.RESET_VIEW})

export function fetchViews(currentViewSlug) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_VIEW_LIST_START
        })

        return axios.get('/api/views/', {
            data: {
                type: 'ticket-list'
            }
        })
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_VIEW_LIST_SUCCESS,
                    resp,
                    currentViewSlug
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_VIEW_LIST_ERROR,
                    error,
                    reason: 'Failed to fetch views'
                })
            })
    }
}

export function submitView(view) {
    return (dispatch) => {
        dispatch({
            type: types.SUBMIT_VIEW_START
        })

        const isUpdate = view.get('id')

        let promise

        if (isUpdate) {
            promise = axios.put(`/api/views/${view.get('id')}/`, view.delete('dirty').toJS())
        } else {
            promise = axios.post('/api/views/', view.delete('dirty').toJS())
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: isUpdate ? types.SUBMIT_UPDATE_VIEW_SUCCESS : types.SUBMIT_NEW_VIEW_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: isUpdate ? types.SUBMIT_UPDATE_VIEW_ERROR : types.SUBMIT_NEW_VIEW_ERROR,
                    error,
                    reason: 'Failed to submit view. Please try again'
                })
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
        return (dispatch) => {
            axios.delete(`/api/views/${view.get('id')}/`)
                .then((json = {}) => json.data)
                .then(() => {
                    dispatch(fetchViews(DEFAULT_VIEW))
                })
                .catch(error => {
                    dispatch({
                        type: 'ERROR',
                        error,
                        reason: 'Failed to delete views'
                    })
                })
        }
    }
    return {
        type: 'NOOP' // action always needs a type
    }
}
