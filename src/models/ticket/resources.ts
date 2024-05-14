import {searchTickets as apiSearchTickets} from '@gorgias/api-client'
import {stringify} from 'qs'
import {TicketSearchOptions} from 'models/search/types'

import client from 'models/api/resources'
import {
    ApiPaginationParams,
    ApiListResponseCursorPagination,
} from 'models/api/types'
import {deepMapKeysToSnakeCase} from 'models/api/utils'
import {Ticket} from 'models/ticket/types'

export const fetchTicketsByTicketIds = async (ticketIds: number[]) => {
    const res = await client.get<ApiListResponseCursorPagination<Ticket[]>>(
        '/api/tickets',
        {
            params: {ticket_ids: ticketIds},
            paramsSerializer: (params) =>
                stringify(params, {arrayFormat: 'repeat'}),
        }
    )

    return res.data.data
}

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
    withHighlights,
    cursor,
    ...rest
}: TicketSearchOptions) => {
    return await apiSearchTickets(
        {
            search: search ?? '',
            filters: filters ?? '',
        },
        {
            ...deepMapKeysToSnakeCase({
                ...rest,
                ...(cursor ? {cursor} : {}),
                ...(withHighlights === true ? {withHighlights: true} : {}),
            }),
        },
        {
            ...(cancelToken ? {cancelToken} : {}),
        }
    )
}
