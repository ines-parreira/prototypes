import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Customer} from 'models/customer/types'
import {
    CustomerSearchOptions,
    CustomerWithHighlightsResponse,
} from 'models/search/types'

export const searchCustomers = async ({
    search,
    cancelToken,
    withHighlights,
    ...rest
}: CustomerSearchOptions) =>
    await client.post<
        ApiListResponseCursorPagination<
            Customer[] | CustomerWithHighlightsResponse[]
        >
    >(
        '/api/customers/search',
        {
            search,
        },
        {
            params: {
                ...deepMapKeysToSnakeCase({
                    ...rest,
                    ...(withHighlights === true ? {withHighlights: true} : {}),
                }),
            },
            cancelToken,
        }
    )

export const getCustomer = async (id: number, cancelToken?: CancelToken) =>
    await client.get<Customer>(`/api/customers/${id}`, {
        cancelToken,
    })
