import {CancelToken} from 'axios'
import {searchCustomers as apiSearchCustomers} from '@gorgias/api-client'
import client from 'models/api/resources'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Customer} from 'models/customer/types'
import {CustomerSearchOptions} from 'models/search/types'

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

export const getCustomer = async (id: number, cancelToken?: CancelToken) =>
    await client.get<Customer>(`/api/customers/${id}`, {
        cancelToken,
    })
