import type { AxiosRequestConfig } from 'axios'

import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import { deepMapKeysToSnakeCase } from 'models/api/utils'

import type { Event, FetchEventsOptions } from './types'

export const fetchEvents = async (
    options: FetchEventsOptions = {},
    config: AxiosRequestConfig = {},
) => {
    const params = deepMapKeysToSnakeCase(options)

    const res = await client.get<ApiListResponseCursorPagination<Event[]>>(
        '/api/events/',
        {
            params,
            paramsSerializer: {
                indexes: null,
            },
            ...config,
        },
    )
    return res
}
