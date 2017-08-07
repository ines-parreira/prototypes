import axios from 'axios'

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

export const createMacro = (macro) => (dispatch) => {
    return axios.post('/api/macros/', macro.delete('id').toJS())
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                status: 'success',
                message: 'Macro created'
            }))

            return Promise.resolve(resp)
        }, error => {
            return dispatch({
                type: types.CREATE_MACRO_ERROR,
                error,
                reason: 'Failed to create macro'
            })
        })
}

export const updateMacro = (macro) => (dispatch) => {
    return axios.put(`/api/macros/${macro.get('id')}/`, macro.toJS())
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                status: 'success',
                message: 'Macro updated'
            }))

            return Promise.resolve(resp)
        }, error => {
            return dispatch({
                type: types.UPDATE_MACRO_ERROR,
                error,
                reason: 'Failed to update macro'
            })
        })
}

export const deleteMacro = (macroId) => (dispatch) => {
    return axios.delete(`/api/macros/${macroId}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch(notify({
                status: 'success',
                message: 'Macro deleted'
            }))

            return Promise.resolve(resp)
        }, error => {
            return dispatch({
                type: types.DELETE_MACRO_ERROR,
                error,
                reason: 'Failed to delete macro'
            })
        })
}
