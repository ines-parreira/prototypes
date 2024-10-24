import {searchCustomers as apiSearchCustomers} from '@gorgias/api-client'
import {CancelToken} from 'axios'

import client from 'models/api/resources'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Customer} from 'models/customer/types'
import {
    CustomerSearchOptions,
    CustomerWithHighlightsResponse,
} from 'models/search/types'
import {mergeEntitiesWithHighlights} from 'models/search/utils'

export const searchCustomers = async ({
    search,
    cancelToken,
    withHighlights,
    cursor,
    ...rest
}: CustomerSearchOptions) =>
    await apiSearchCustomers(
        {
            search,
        },
        {
            ...deepMapKeysToSnakeCase({
                ...rest,
                ...(cursor ? {cursor} : {}),
                ...(withHighlights === true ? {withHighlights: true} : {}),
            }),
        },
        {...(cancelToken ? {cancelToken} : {})}
    )

export const searchCustomersWithHighlights = async (
    options: Omit<CustomerSearchOptions, 'withHighlights'>
) =>
    searchCustomers({
        ...options,
        withHighlights: true,
    }).then((resp) => ({
        ...resp,
        data: {
            ...resp.data,
            data: (resp.data?.data as CustomerWithHighlightsResponse[]).map(
                mergeEntitiesWithHighlights
            ),
        },
    }))

export const getCustomer = async (id: number, cancelToken?: CancelToken) =>
    await client.get<Customer>(`/api/customers/${id}`, {
        cancelToken,
    })
