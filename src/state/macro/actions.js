// @flow
import axios, {type CancelToken} from 'axios'
import {fromJS, Map} from 'immutable'
import _get from 'lodash/get'

import {notify} from '../notifications/actions'
import type {dispatchType, thunkActionType} from '../types'

import * as constants from './constants'

type fetchMacrosParamsTypes = {
    search?: string,
    page?: number,
    currentMacros?: Map<*, *>,
    currentPage?: number,
    ticketId?: number,
    messageId?: number,
    _fallbackOrderBy?: string,
}

type MacrosSearchResult = {
    macros: Map<*, *>,
    page: number,
    totalPages: number,
}

export const fetchMacros = (
    filters: fetchMacrosParamsTypes = {},
    orderBy: string = '',
    orderDir: string = 'asc',
    cancelToken?: CancelToken
): thunkActionType => (
    dispatch: dispatchType
): Promise<?MacrosSearchResult> => {
    let params = {}
    if (filters['page']) {
        params.page = filters['page']
    }
    if (filters['search']) {
        params.search = filters['search']
    } else if (orderBy) {
        params.order_by = orderBy
        params.order_dir = orderDir
    }

    if (orderBy === 'relevance') {
        params.ticket_id = filters['ticketId']
        params.message_id = filters['messageId']
        params._fallback_order_by = filters['_fallbackOrderBy']
    }

    return axios
        .get('/api/macros/', {
            params,
            ...(cancelToken ? {cancelToken} : {}),
        })
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                const page = _get(resp, ['meta', 'page'])
                const totalPages = _get(resp, ['meta', 'nb_pages'])
                let macros = fromJS(resp.data || [])

                dispatch({
                    type: constants.UPSERT_MACROS,
                    payload: macros,
                })

                // merge macros if we loaded the next page
                if (filters.currentMacros && filters.currentPage + 1 === page) {
                    macros = filters.currentMacros.concat(macros)
                }

                return {
                    macros,
                    page,
                    totalPages,
                }
            },
            (error) => {
                if (!axios.isCancel(error)) {
                    return dispatch(
                        notify({
                            status: 'error',
                            message: 'Failed to fetch macros',
                        })
                    )
                }
            }
        )
}

export const getMacro = (
    id: string,
    cancelToken?: CancelToken
): thunkActionType => async (dispatch: dispatchType): Promise<?Map<*, *>> => {
    try {
        const {data} = await axios.get(
            `/api/macros/${id}`,
            cancelToken && {cancelToken}
        )
        const macro = fromJS(data)
        dispatch({
            type: constants.UPSERT_MACRO,
            payload: macro,
        })
        return macro
    } catch (error) {
        if (!axios.isCancel(error)) {
            dispatch(
                notify({
                    status: 'error',
                    message: 'Failed to fetch macro',
                })
            )
        }
    }
}

export const createMacro = (macro: Map<*, *>): thunkActionType => (
    dispatch: dispatchType
): Promise<dispatchType> => {
    return axios
        .post('/api/macros/', macro.toJS())
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Macro created',
                    })
                )

                dispatch({
                    type: constants.UPSERT_MACRO,
                    payload: fromJS(resp),
                })

                return Promise.resolve(resp)
            },
            () => {
                return dispatch(
                    notify({
                        status: 'error',
                        message: 'Failed to create macro',
                    })
                )
            }
        )
}

export const updateMacro = (macro: Map<*, *>): thunkActionType => (
    dispatch: dispatchType
): Promise<dispatchType> => {
    return axios
        .put(`/api/macros/${macro.get('id')}/`, macro.toJS())
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Macro updated',
                    })
                )

                dispatch({
                    type: constants.UPSERT_MACRO,
                    payload: fromJS(resp),
                })

                return Promise.resolve(resp)
            },
            () => {
                return dispatch(
                    notify({
                        status: 'error',
                        message: 'Failed to update macro',
                    })
                )
            }
        )
}

export const deleteMacro = (macroId: string): thunkActionType => (
    dispatch: dispatchType
): Promise<dispatchType> => {
    return axios
        .delete(`/api/macros/${macroId}/`)
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                dispatch(
                    notify({
                        status: 'success',
                        message: 'Macro deleted',
                    })
                )

                dispatch({
                    type: constants.DELETE_MACRO,
                    payload: macroId,
                })

                return Promise.resolve(resp)
            },
            (error) => {
                return dispatch({
                    type: constants.DELETE_MACRO_ERROR,
                    reason: 'Failed to delete macro',
                    verbose: true,
                    error,
                })
            }
        )
}
