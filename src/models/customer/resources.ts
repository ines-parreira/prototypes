import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'

import {Customer, CustomerSearchOptions} from './types'

export const searchCustomers = async ({
    search,
    cancelToken,
    ...rest
}: CustomerSearchOptions) => {
    return await client.post<ApiListResponseCursorPagination<Customer[]>>(
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
}
