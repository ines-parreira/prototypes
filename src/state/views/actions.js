import axios from 'axios'
import {notify} from '../notifications/actions'
import {browserHistory} from 'react-router'
import * as types from './constants'

export const setViewActive = (view) => ({
    type: types.SET_VIEW_ACTIVE,
    view
})

export const updateView = (view, edit = true) => ({
    type: types.UPDATE_VIEW,
    view,
    edit
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

// update a filter value
export const updateFieldFilter = (index, value) => ({
    type: types.UPDATE_VIEW_FIELD_FILTER,
    index,
    value
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

export function fetchViews(currentViewId) {
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
                    currentViewId
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
        const isUpdate = !!view.get('id', '')

        dispatch({
            type: types.SUBMIT_VIEW_START
        })

        let promise

        if (isUpdate) {
            promise = axios.put(`/api/views/${view.get('id')}/`, view.delete('dirty').delete('editMode').toJS())
        } else {
            promise = axios.post('/api/views/', view.delete('dirty').delete('editMode').toJS())
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
    return (dispatch, getState) => {
        if (getState().views.get('items').size <= 1) {
            return dispatch(notify({
                type: 'error',
                title: 'This view cannot be deleted',
                message: 'This is your last view, it needs to exist in order for the helpdesk to function correctly.'
            }))
        }

        if (window.confirm('You\'re about to delete this view for all users. Are you sure?')) {
            axios.delete(`/api/views/${view.get('id')}/`)
                .then((json = {}) => json.data)
                .then(() => {
                    browserHistory.push('/app')

                    dispatch({
                        type: types.DELETE_VIEW_SUCCESS,
                        viewId: view.get('id')
                    })
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
}
