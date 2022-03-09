import qs from 'qs'

import {AxiosRequestConfig} from 'axios'
import client from '../api/resources'
import {ApiListResponseCursorPagination} from '../api/types'
import {deepMapKeysToSnakeCase} from '../api/utils'

import {Event, FetchEventsOptions} from './types'

type APIFetchEventsOptions = {
    object_id?: FetchEventsOptions['objectId']
    created_datetime?: FetchEventsOptions['createdDatetime']
    order_dir?: FetchEventsOptions['orderDir']
    order_by?: FetchEventsOptions['orderBy']
    object_type?: FetchEventsOptions['objectType']
    types?: FetchEventsOptions['types']
    user_ids?: FetchEventsOptions['userIds']
    cursor?: FetchEventsOptions['cursor']
    limit?: number
}

export const fetchEvents = async (
    options: FetchEventsOptions = {},
    config: AxiosRequestConfig = {}
) => {
    const params: APIFetchEventsOptions = deepMapKeysToSnakeCase(options)

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
