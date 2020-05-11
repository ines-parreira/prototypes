//@flow
import _snakeCase from 'lodash/snakeCase'

import client, {
    deepMapKeysToSnakeCase,
    type ApiListResponsePagination,
    type MetaSortOptions,
    type OrderDirection,
} from '../api'

import type {Macro, MacroDraft, MacroSortableProperties} from './types'

export type FetchMacrosOptions = {
    fallbackOrderBy?: MacroSortableProperties,
    messageId?: number,
    orderBy?: MacroSortableProperties | MetaSortOptions,
    orderDir?: OrderDirection,
    page?: number,
    search?: string,
    ticketId?: number,
}

export const fetchMacros = async (
    options: FetchMacrosOptions = {}
): Promise<ApiListResponsePagination<Macro[]>> => {
    const params = deepMapKeysToSnakeCase(options)
    if (params.fallback_order_by) {
        delete params.fallback_order_by
        params._fallback_order_by = _snakeCase(options.fallbackOrderBy)
    }
    if (params.order_by) {
        params.order_by = _snakeCase(options.orderBy)
    }
    const res = await client.get('/api/macros/', {params})
    return res.data
}

export const fetchMacro = async (id: number): Promise<Macro> => {
    const res = await client.get(`/api/macros/${id}/`)
    return res.data
}

export const createMacro = async (macro: MacroDraft): Promise<Macro> => {
    const res = await client.post('/api/macros/', macro)
    return res.data
}

export const updateMacro = async (macro: Macro): Promise<Macro> => {
    const res = await client.put(`/api/macros/${macro.id}/`, macro)
    return res.data
}

export const deleteMacro = async (id: number): Promise<void> => {
    await client.delete(`/api/macros/${id}/`)
}
