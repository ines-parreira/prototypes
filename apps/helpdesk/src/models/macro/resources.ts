import type { AxiosRequestConfig } from 'axios'

import type { ListMacrosParams, Macro } from '@gorgias/helpdesk-queries'

import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import { deepMapKeysToSnakeCase } from 'models/api/utils'

import type { MacroDraft } from './types'

export const fetchMacros = async (
    options: ListMacrosParams = {},
    config: AxiosRequestConfig = {},
) => {
    const params: Record<string, unknown> = deepMapKeysToSnakeCase(options)

    const res = await client.get<ApiListResponseCursorPagination<Macro[]>>(
        '/api/macros/',
        {
            params: {
                limit: 30,
                ...params,
            },
            paramsSerializer: {
                indexes: null,
            },
            ...config,
        },
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
