import client from 'models/api/resources'
import {
    ApiPaginationParams,
    ApiListResponseCursorPagination,
} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'
import {Ticket, TicketSearchOptions} from 'models/ticket/types'

export const fetchTicketsByRuleId = async (
    ruleId: number,
    params: ApiPaginationParams
): Promise<ApiListResponseCursorPagination<Ticket[]>> => {
    const res = await client.get('/api/tickets', {
        params: {...params, rule_id: ruleId},
    })
    return res.data as ApiListResponseCursorPagination<Ticket[]>
}

export const searchTickets = async ({
    search,
    filters,
    cancelToken,
    orderBy,
    orderDir,
    ...rest
}: TicketSearchOptions) => {
    return await client.post<ApiListResponseCursorPagination<Ticket[]>>(
        '/api/tickets/search',
        {
            search,
            filters,
        },
        {
            params: {
                ...deepMapKeysToSnakeCase({...rest}),
                order_by: orderBy && orderDir && `${orderBy}:${orderDir}`,
            },
            cancelToken,
        }
    )
}
