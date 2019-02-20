// @flow
import axios from 'axios'
import {fromJS, Map} from 'immutable'
import _pick from 'lodash/pick'
import _get from 'lodash/get'

import {notify} from '../notifications/actions'
import type {dispatchType, thunkActionType} from '../types'

import * as constants from './constants'


type fetchMacrosParamsTypes = {
    search?: string,
    page?: number,
    currentMacros?: Map<*,*>,
    currentPage?: number,
}

export const fetchMacros = (filters: fetchMacrosParamsTypes = {},
                            orderBy: string = '', orderDir: string = 'asc'): thunkActionType =>
    (dispatch: dispatchType): Promise<dispatchType> => {
        const params = _pick(filters, ['search', 'page'])
        if (orderBy) {
            params.order_by = orderBy
            params.order_dir = orderDir
        }


        return axios.get('/api/macros/', {params})
            .then((json = {}) => json.data)
            .then((resp) => {
                const page = _get(resp, ['meta', 'page'])
                const totalPages = _get(resp, ['meta', 'nb_pages'])
                let macros = fromJS(resp.data || [])

                // merge macros if we loaded the next page
                if (filters.currentMacros && filters.currentPage + 1 === page) {
                    macros = filters.currentMacros.concat(macros)
                }

                return {
                    macros,
                    page,
                    totalPages,
                }
            }, () => {
                return dispatch(notify({
                    status: 'error',
                    message: 'Failed to fetch macros',
                }))
            })
    }

export const createMacro = (macro: Map<*, *>): thunkActionType =>
    (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.post('/api/macros/', macro.toJS())
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Macro created'
                }))

                return Promise.resolve(resp)
            }, () => {
                return dispatch(notify({
                    status: 'error',
                    message: 'Failed to create macro'
                }))
            })
    }

export const updateMacro = (macro: Map<*, *>): thunkActionType =>
    (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.put(`/api/macros/${macro.get('id')}/`, macro.toJS())
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Macro updated'
                }))
                return Promise.resolve(resp)
            }, () => {
                return dispatch(notify({
                    status: 'error',
                    message: 'Failed to update macro'
                }))
            })
    }

export const deleteMacro = (macroId: string): thunkActionType =>
    (dispatch: dispatchType): Promise<dispatchType> => {
        return axios.delete(`/api/macros/${macroId}/`)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    status: 'success',
                    message: 'Macro deleted'
                }))

                return Promise.resolve(resp)
            }, (error) => {
                return dispatch({
                    type: constants.DELETE_MACRO_ERROR,
                    reason: 'Failed to delete the integration',
                    verbose: true,
                    error,
                })
            })
    }
