import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'
import {FetchWidgetsOptions} from 'models/widget/types'
import {Widget} from 'state/widgets/types'

export const fetchWidgets = async (options: FetchWidgetsOptions = {}) => {
    const params: Record<string, unknown> = deepMapKeysToSnakeCase(options)
    if (!options.orderBy) {
        params.order_by = 'order:asc'
    }

    return await client.get<ApiListResponseCursorPagination<Widget[]>>(
        '/api/widgets/',
        {
            params,
        }
    )
}
