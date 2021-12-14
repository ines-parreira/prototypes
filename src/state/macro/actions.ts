import axios, {CancelToken, AxiosError} from 'axios'
import {fromJS, Map, List} from 'immutable'
import _get from 'lodash/get'

import {Macro} from '../../models/macro/types'
import client from '../../models/api/resources'
import {ApiListResponsePagination, GorgiasError} from '../../models/api/types'
import {NotificationStatus} from '../notifications/types'
import {notify} from '../notifications/actions'
import {StoreDispatch} from '../types'

import * as constants from './constants'
import {getErrorReason} from './utils'

export type fetchMacrosParamsTypes = {
    search?: string
    page?: number
    currentMacros?: List<any>
    currentPage?: number
    ticketId?: number
    messageId?: number
    perPage?: number
    _fallbackOrderBy?: string
}

export type MacrosSearchResult = {
    macros: List<any>
    page: number
    totalPages: number
}

export const fetchMacros =
    (
        filters: fetchMacrosParamsTypes = {},
        orderBy = '',
        orderDir = 'asc',
        cancelToken?: CancelToken
    ) =>
    (dispatch: StoreDispatch): Promise<MacrosSearchResult> => {
        const params: {
            page?: number
            search?: string
            order_by?: string
            order_dir?: string
            ticket_id?: number
            message_id?: number
            per_page?: number
            _fallback_order_by?: string
        } = {}
        if (filters['page']) {
            params.page = filters['page']
        }
        if (filters['search']) {
            params.search = filters['search']
        } else if (orderBy) {
            params.order_by = orderBy
            params.order_dir = orderDir
        }
        if (filters['perPage']) {
            params.per_page = filters['perPage']
        }

        if (orderBy === 'relevance') {
            params.ticket_id = filters['ticketId']
            params.message_id = filters['messageId']
            params._fallback_order_by = filters['_fallbackOrderBy']
        }

        return client
            .get<ApiListResponsePagination<Macro[]>>('/api/macros/', {
                params,
                ...(cancelToken ? {cancelToken} : {}),
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const page = _get(resp, ['meta', 'page'])
                    const totalPages = _get(resp, ['meta', 'nb_pages'])
                    let macros = fromJS(resp.data || []) as List<any>

                    dispatch({
                        type: constants.UPSERT_MACROS,
                        payload: macros,
                    })

                    // merge macros if we loaded the next page
                    if (
                        filters.currentMacros &&
                        filters.currentPage != null &&
                        filters.currentPage + 1 === page
                    ) {
                        macros = filters.currentMacros.concat(
                            macros
                        ) as List<any>
                    }

                    return {
                        macros,
                        page,
                        totalPages,
                    }
                },
                (error: AxiosError) => {
                    if (axios.isCancel(error)) {
                        return Promise.resolve()
                    }
                    return dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Failed to fetch macros',
                        })
                    )
                }
            ) as Promise<MacrosSearchResult>
    }

export const getMacro =
    (id: string, cancelToken?: CancelToken) =>
    async (dispatch: StoreDispatch) => {
        try {
            const {data} = await client.get<Macro>(
                `/api/macros/${id}`,
                cancelToken && {cancelToken}
            )
            const macro = fromJS(data) as Map<any, any>
            dispatch({
                type: constants.UPSERT_MACRO,
                payload: macro,
            })
            return macro
        } catch (error) {
            if (!axios.isCancel(error)) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: 'Failed to fetch macro',
                    })
                )
            }
        }
    }

export const createMacro =
    (macro: Map<any, any>) =>
    (dispatch: StoreDispatch): Promise<Macro> => {
        return client
            .post<Macro>('/api/macros/', macro.toJS())
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Macro created',
                        })
                    )

                    dispatch({
                        type: constants.UPSERT_MACRO,
                        payload: fromJS(resp),
                    })

                    return Promise.resolve(resp)
                },
                (error) => {
                    const gorgiasError = error as GorgiasError
                    const message = gorgiasError.response.data.error.msg
                    const reason = getErrorReason(gorgiasError)
                    return dispatch(
                        notify({
                            message: `${message} ${reason}`,
                            status: NotificationStatus.Error,
                        })
                    )
                }
            ) as Promise<Macro>
    }

export const updateMacro =
    (macro: Map<any, any>) =>
    (dispatch: StoreDispatch): Promise<Macro> => {
        return client
            .put<Macro>(
                `/api/macros/${macro.get('id') as number}/`,
                macro.toJS()
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Macro updated',
                        })
                    )

                    dispatch({
                        type: constants.UPSERT_MACRO,
                        payload: fromJS(resp),
                    })

                    return Promise.resolve(resp)
                },
                (error) => {
                    const gorgiasError = error as GorgiasError
                    const message = gorgiasError.response.data.error.msg
                    const reason = getErrorReason(gorgiasError)
                    return dispatch(
                        notify({
                            message: `${message} ${reason}`,
                            status: NotificationStatus.Error,
                        })
                    )
                }
            ) as Promise<Macro>
    }

export const deleteMacro =
    (macroId: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete<undefined>(`/api/macros/${macroId}/`).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Macro deleted',
                    })
                )

                dispatch({
                    type: constants.DELETE_MACRO,
                    payload: macroId,
                })

                return Promise.resolve()
            },
            (error: AxiosError) => {
                return dispatch({
                    type: constants.DELETE_MACRO_ERROR,
                    reason: 'Failed to delete macro',
                    verbose: true,
                    error,
                })
            }
        )
    }
