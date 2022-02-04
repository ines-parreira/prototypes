import qs from 'qs'

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
}

export const fetchEvents = async (options: FetchEventsOptions = {}) => {
    const params: APIFetchEventsOptions = deepMapKeysToSnakeCase(options)

    const res = await client.get<ApiListResponseCursorPagination<Event[]>>(
        '/api/events/',
        {
            params,
            paramsSerializer: function (params) {
                return qs.stringify(params, {arrayFormat: 'repeat'})
            },
        }
    )
    return res
}
