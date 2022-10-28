import qs from 'qs'

import {AxiosRequestConfig} from 'axios'
import client from '../api/resources'
import {ApiListResponseCursorPagination} from '../api/types'
import {deepMapKeysToSnakeCase} from '../api/utils'

import {Event, FetchEventsOptions} from './types'

export const fetchEvents = async (
    options: FetchEventsOptions = {},
    config: AxiosRequestConfig = {}
) => {
    const params = deepMapKeysToSnakeCase(options)

    const res = await client.get<ApiListResponseCursorPagination<Event[]>>(
        '/api/events/',
        {
            params,
            paramsSerializer: function (params) {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            },
            ...config,
        }
    )
    return res
}
