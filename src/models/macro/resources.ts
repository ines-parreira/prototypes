import {CancelToken} from 'axios'
import _snakeCase from 'lodash/snakeCase'

import {deepMapKeysToSnakeCase} from '../api/utils'
import client from '../api/resources'
import {ApiListResponsePagination} from '../api/types'

import {Macro, MacroDraft, FetchMacrosOptions} from './types'

type APIFetchMacrosOptions = {
    fallback_order_by?: FetchMacrosOptions['fallbackOrderBy']
    _fallback_order_by?: string
    message_id?: FetchMacrosOptions['messageId']
    order_by?: string
    order_dir?: FetchMacrosOptions['orderDir']
    page?: FetchMacrosOptions['page']
    search?: FetchMacrosOptions['search']
    ticket_id?: FetchMacrosOptions['ticketId']
}

export const fetchMacros = async (
    options: FetchMacrosOptions = {},
    cancelToken?: CancelToken
): Promise<ApiListResponsePagination<Macro[]>> => {
    const params: APIFetchMacrosOptions = deepMapKeysToSnakeCase(options)
    if (params.fallback_order_by) {
        delete params.fallback_order_by
        params._fallback_order_by = _snakeCase(options.fallbackOrderBy)
    }
    if (params.order_by) {
        params.order_by = _snakeCase(options.orderBy)
    }
    const res = await client.get('/api/macros/', {params, cancelToken})
    return res.data as ApiListResponsePagination<Macro[]>
}

export const fetchMacro = async (id: number): Promise<Macro> => {
    const res = await client.get(`/api/macros/${id}/`)
    return res.data as Macro
}

export const createMacro = async (macro: MacroDraft): Promise<Macro> => {
    const res = await client.post('/api/macros/', macro)
    return res.data as Macro
}

export const updateMacro = async (macro: Macro): Promise<Macro> => {
    const res = await client.put(`/api/macros/${macro.id}/`, macro)
    return res.data as Macro
}

export const deleteMacro = async (id: number): Promise<void> => {
    await client.delete(`/api/macros/${id}/`)
}
