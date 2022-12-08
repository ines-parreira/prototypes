import {AxiosRequestConfig} from 'axios'
import qs from 'qs'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Macro, MacroDraft, FetchMacrosOptions} from './types'

export const fetchMacros = async (
    options: FetchMacrosOptions = {},
    config: AxiosRequestConfig = {}
) => {
    const params: Record<string, unknown> = deepMapKeysToSnakeCase(options)

    const res = await client.get<ApiListResponseCursorPagination<Macro[]>>(
        '/api/macros/',
        {
            params: {
                limit: 30,
                ...params,
            },
            paramsSerializer: (params) =>
                qs.stringify(params, {arrayFormat: 'repeat'}),
            ...config,
        }
    )
    return res
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
