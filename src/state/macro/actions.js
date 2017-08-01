import axios from 'axios'
import {fromJS} from 'immutable'

import * as types from './constants'
import {notify} from '../notifications/actions'

export const openModal = () => ({
    type: types.OPEN_MODAL
})

export const closeModal = () => ({
    type: types.CLOSE_MODAL
})

export const setMacrosVisible = (visible) => ({
    type: types.SET_MACROS_VISIBILITY,
    visible
})

export const fetchMacros = () => (dispatch) => {
    dispatch({
        type: types.FETCH_MACRO_LIST_START
    })

    return axios.get('/api/macros/')
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.FETCH_MACRO_LIST_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.FETCH_MACRO_LIST_ERROR,
                error,
                reason: 'Failed to fetch macros'
            })
        })
}

export const searchMacros = (term) => (dispatch) => {
    return axios.post('/api/search/', {type: 'macro', query: term})
        .then((json = {}) => json.data)
        .then(resp => {
            return fromJS(resp.data)
        }, error => {
            return dispatch({
                type: types.SEARCH_MACRO_ERROR,
                error,
                reason: 'Failed to search macros'
            })
        })
}


export const createMacro = (macro) => (dispatch) => {
    dispatch({
        type: types.CREATE_MACRO_START
    })

    return axios.post('/api/macros/', macro.delete('id').toJS())
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                type: 'success',
                message: 'Macro created'
            }))

            return dispatch({
                type: types.CREATE_MACRO_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.CREATE_MACRO_ERROR,
                error,
                reason: 'Failed to create macro'
            })
        })
}

export const updateMacro = (macro) => (dispatch) => {
    dispatch({
        type: types.UPDATE_MACRO_START
    })
    return axios.put(`/api/macros/${macro.get('id')}/`, macro.toJS())
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                type: 'success',
                message: 'Macro updated'
            }))

            return dispatch({
                type: types.UPDATE_MACRO_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.UPDATE_MACRO_ERROR,
                error,
                reason: 'Failed to update macro'
            })
        })
}

export const deleteMacro = (macroId) => (dispatch) => {
    dispatch({
        type: types.DELETE_MACRO_START
    })

    return axios.delete(`/api/macros/${macroId}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                type: 'success',
                message: 'Macro deleted'
            }))

            return dispatch({
                type: types.DELETE_MACRO_SUCCESS,
                macroId,
                resp
            })
        }, error => {
            return dispatch({
                type: types.DELETE_MACRO_ERROR,
                error,
                reason: 'Failed to delete macro'
            })
        })
}
