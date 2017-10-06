// @flow
import axios from 'axios'

import * as constants from './constants'
import {notify} from '../notifications/actions'

import type {Map} from 'immutable'
import type {dispatchType, actionType} from '../types'

export const openModal = (): actionType => ({
    type: constants.OPEN_MODAL
})

export const closeModal = (): actionType => ({
    type: constants.CLOSE_MODAL
})

export const setMacrosVisible = (visible: boolean): actionType => ({
    type: constants.SET_MACROS_VISIBILITY,
    visible
})

export const fetchMacros = () => (dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.FETCH_MACRO_LIST_START
    })

    return axios.get('/api/macros/')
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: constants.FETCH_MACRO_LIST_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: constants.FETCH_MACRO_LIST_ERROR,
                error,
                reason: 'Failed to fetch macros'
            })
        })
}

export const createMacro = (macro: Map<*,*>) => (dispatch: dispatchType): Promise<dispatchType> => {
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
                type: constants.CREATE_MACRO_ERROR,
                error,
                reason: 'Failed to create macro'
            })
        })
}

export const updateMacro = (macro: Map<*,*>) => (dispatch: dispatchType): Promise<dispatchType> => {
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
                type: constants.UPDATE_MACRO_ERROR,
                error,
                reason: 'Failed to update macro'
            })
        })
}

export const deleteMacro = (macroId: string) => (dispatch: dispatchType): Promise<dispatchType> => {
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
                type: constants.DELETE_MACRO_ERROR,
                error,
                reason: 'Failed to delete macro'
            })
        })
}
