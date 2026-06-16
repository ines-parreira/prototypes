import client from '@repo/api-resources'
import type { AxiosError, CancelToken } from 'axios'
import { isCancel } from 'axios'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'

import { toast } from '@gorgias/axiom'
import type { ListMacrosParams, Macro } from '@gorgias/helpdesk-queries'

import { fetchMacros as fetchMacrosRequest } from 'models/macro/resources'
import { GorgiasApi } from 'services/gorgiasApi'
import type { StoreDispatch } from 'state/types'

import * as constants from './constants'
import { isMacroApiError } from './types'
import { getErrorReason } from './utils'

export function fetchMacros(
    options: ListMacrosParams,
    cancelToken: CancelToken,
) {
    return async (__dispatch: StoreDispatch) => {
        try {
            const { data } = await fetchMacrosRequest(options, { cancelToken })

            return {
                data: data.data.sort(
                    (a, b) => a.relevance_rank! - b.relevance_rank!,
                ),
                meta: data.meta,
            }
        } catch (error) {
            if (isCancel(error)) {
                return Promise.resolve()
            }
            toast.error('Failed to fetch macros')
        }
    }
}

export function fetchAllMacros(
    options: ListMacrosParams,
    cancelToken: CancelToken,
) {
    return async (dispatch: StoreDispatch) => {
        const client = new GorgiasApi()
        const generator = client.cursorPaginate(fetchMacrosRequest, options, {
            cancelToken,
        })

        let result: Macro[] = []

        try {
            for await (const page of generator) {
                result = result.concat(page)
            }
            const macros = fromJS(result || []) as List<any>

            dispatch({
                type: constants.UPSERT_MACROS,
                payload: macros,
            })

            return macros.sort(
                (a: Map<any, any>, b: Map<any, any>) =>
                    a.get('relevance_rank') - b.get('relevance_rank'),
            ) as List<any>
        } catch (error) {
            if (isCancel(error)) {
                return Promise.resolve()
            }
            toast.error('Failed to fetch macros')
        }
    }
}

export const getMacro =
    (id: string, cancelToken?: CancelToken) =>
    async (dispatch: StoreDispatch) => {
        if (!id) return
        try {
            const { data } = await client.get<Macro>(
                `/api/macros/${id}`,
                cancelToken && { cancelToken },
            )
            const macro = fromJS(data) as Map<any, any>
            dispatch({
                type: constants.UPSERT_MACRO,
                payload: macro,
            })
            return macro
        } catch (error) {
            if (!isCancel(error)) {
                toast.error('Failed to fetch macro')
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
                    toast.success('Macro created')

                    dispatch({
                        type: constants.UPSERT_MACRO,
                        payload: fromJS(resp),
                    })

                    return Promise.resolve(resp)
                },
                (error) => {
                    if (isMacroApiError(error)) {
                        const message = error.response.data.error.msg
                        const reason = getErrorReason(error)
                        toast.error(`${message} ${reason}`)
                        return
                    }

                    toast.error('Failed to create macro')
                },
            ) as Promise<Macro>
    }

export const updateMacro =
    (macro: Map<any, any>) =>
    (dispatch: StoreDispatch): Promise<Macro> => {
        return client
            .put<Macro>(
                `/api/macros/${macro.get('id') as number}/`,
                macro.toJS(),
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    toast.success('Macro updated')

                    dispatch({
                        type: constants.UPSERT_MACRO,
                        payload: fromJS(resp),
                    })

                    return Promise.resolve(resp)
                },
                (error) => {
                    if (isMacroApiError(error)) {
                        const message = error.response.data.error.msg
                        const reason = getErrorReason(error)
                        toast.error(`${message} ${reason}`)
                        return
                    }

                    toast.error('Failed to update macro')
                },
            ) as Promise<Macro>
    }

export const deleteMacro =
    (macroId: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.delete<undefined>(`/api/macros/${macroId}/`).then(
            () => {
                toast.success('Macro deleted')

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
            },
        )
    }
