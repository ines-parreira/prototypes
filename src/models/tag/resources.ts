import {AxiosRequestConfig} from 'axios'
import _snakeCase from 'lodash/snakeCase'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Tag, TagDraft, FetchTagsOptions} from './types'

export const fetchTags = async (
    options: FetchTagsOptions = {},
    config: AxiosRequestConfig = {}
) => {
    const params: Record<string, unknown> = deepMapKeysToSnakeCase({
        ...options,
        ...(!options.limit ? {limit: 30} : {}),
    })

    if (params.order_by) {
        params.order_by = _snakeCase(options.orderBy)
    }

    return await client.get<ApiListResponseCursorPagination<Tag[]>>(
        '/api/tags/',
        {
            params,
            ...config,
        }
    )
}

export const fetchTag = async (id: number): Promise<Tag> => {
    const res = await client.get<Tag>(`/api/tags/${id}/`)
    return res.data
}

export const createTag = async (tag: TagDraft): Promise<Tag> => {
    const res = await client.post<Tag>('/api/tags/', tag)
    return res.data
}

export const updateTag = async (tag: Tag): Promise<Tag> => {
    const res = await client.put<Tag>(`/api/tags/${tag.id}/`, tag)
    return res.data
}

export const deleteTag = async (id: number): Promise<void> => {
    await client.delete(`/api/tags/${id}/`)
}
