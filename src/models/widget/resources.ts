import client from 'models/api/resources'
import {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'

import {FetchWidgetsOptions, Widget} from 'state/widgets/types'

export type APIFetchWidgetsOptions = Pick<
    ApiPaginationParams,
    'cursor' | 'limit'
> & {
    order_by?: FetchWidgetsOptions['orderBy']
}

export const fetchWidgets = async (params: APIFetchWidgetsOptions = {}) =>
    await client.get<ApiListResponseCursorPagination<Widget[]>>(
        '/api/widgets/',
        {
            params,
        }
    )
