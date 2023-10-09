import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Customer, CustomerSearchOptions} from './types'

export const searchCustomers = async ({
    search,
    cancelToken,
    ...rest
}: CustomerSearchOptions) =>
    await client.post<ApiListResponseCursorPagination<Customer[]>>(
        '/api/customers/search',
        {
            search,
        },
        {
            params: {
                ...deepMapKeysToSnakeCase({...rest}),
            },
            cancelToken,
        }
    )

export const getCustomer = async (id: number, cancelToken?: CancelToken) =>
    await client.get<Customer>(`/api/customers/${id}`, {
        cancelToken,
    })
