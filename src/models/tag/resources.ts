import { AxiosRequestConfig } from 'axios'

import {
    ListTagsOrderBy,
    ListTagsParams,
    OrderDirection,
    Tag,
} from '@gorgias/helpdesk-queries'

import client from 'models/api/resources'
import { ApiListResponseCursorPagination } from 'models/api/types'

import { OrderByOrderDir, TagDraft } from './types'

const USAGE_ORDER_BYS = [
    `${ListTagsOrderBy.Usage}:${OrderDirection.Asc}`,
    `${ListTagsOrderBy.Usage}:${OrderDirection.Desc}`,
] as const
type UsageOrderBy = (typeof USAGE_ORDER_BYS)[number]

function isMissingSecondOrderBy(value?: string): value is UsageOrderBy {
    return !!USAGE_ORDER_BYS.find((orderBy) => orderBy === value)
}

export const fetchTags = async (
    params: Omit<ListTagsParams, 'order_by'> & {
        order_by?: OrderByOrderDir | ListTagsParams['order_by']
    } = {},
    config: AxiosRequestConfig = {},
) => {
    return await client.get<ApiListResponseCursorPagination<Tag[]>>(
        '/api/tags/',
        {
            params: {
                limit: 30,
                ...params,
                // when sorting by usage, the second sorting attribute needs to be defined explicitly
                ...(isMissingSecondOrderBy(params.order_by)
                    ? {
                          order_by: `${params.order_by},${
                              ListTagsOrderBy.Name
                          }:${params.order_by.split(':')[1] as OrderDirection}`,
                      }
                    : {}),
            },
            ...config,
        },
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
