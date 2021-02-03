import {CancelToken} from 'axios'
import _snakeCase from 'lodash/snakeCase'

import {deepMapKeysToSnakeCase} from '../api/utils'
import client from '../api/resources'
import {ApiListResponsePagination} from '../api/types'

import {Tag, TagDraft, FetchTagsOptions} from './types'

type APIFetchTagsOptions = {
    order_by?: string
    order_dir?: FetchTagsOptions['orderDir']
    page?: FetchTagsOptions['page']
    search?: FetchTagsOptions['search']
}

export const fetchTags = async (
    options: FetchTagsOptions = {},
    cancelToken?: CancelToken
): Promise<ApiListResponsePagination<Tag[]>> => {
    const params: APIFetchTagsOptions = deepMapKeysToSnakeCase(options)

    if (params.order_by) {
        params.order_by = _snakeCase(options.orderBy)
    }
    const res = await client.get<ApiListResponsePagination<Tag[]>>(
        '/api/tags/',
        {params, cancelToken}
    )
    return res.data
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
