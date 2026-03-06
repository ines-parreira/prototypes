import { stringify } from 'qs'

import { searchTickets as apiSearchTickets } from '@gorgias/helpdesk-client'

import client from 'models/api/resources'
import type {
    ApiListResponseCursorPagination,
    ApiPaginationParams,
} from 'models/api/types'
import { deepMapKeysToSnakeCase } from 'models/api/utils'
import type {
    PickedTicketWithHighlights,
    TicketSearchOptions,
    TicketWithHighlightsResponse,
} from 'models/search/types'
import { mergeEntitiesWithHighlights } from 'models/search/utils'
import type { Ticket } from 'models/ticket/types'

export const fetchTicketsByTicketIds = async (ticketIds: number[]) => {
    const res = await client.get<ApiListResponseCursorPagination<Ticket[]>>(
        '/api/tickets',
        {
            params: { ticket_ids: ticketIds },
            paramsSerializer: (params) =>
                stringify(params, { arrayFormat: 'repeat' }),
        },
    )

    return res.data.data
}

export const fetchTicketsByRuleId = async (
    ruleId: number,
    params: ApiPaginationParams,
): Promise<ApiListResponseCursorPagination<Ticket[]>> => {
    const res = await client.get('/api/tickets', {
        params: { ...params, rule_id: ruleId },
    })
    return res.data as ApiListResponseCursorPagination<Ticket[]>
}

export const searchTickets = async ({
    search,
    filters,
    cancelToken,
    withHighlights,
    trackTotalHits,
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
                ...(cursor ? { cursor } : {}),
                ...(withHighlights === true ? { withHighlights: true } : {}),
                ...(trackTotalHits === true ? { trackTotalHits: true } : {}),
            }),
        },
        cancelToken ? { cancelToken } : {},
    )
}

export const searchTicketsWithHighlights = (
    options: Omit<TicketSearchOptions, 'withHighlights'>,
) =>
    searchTickets({ ...options, withHighlights: true }).then((resp) => ({
        ...resp,
        data: {
            ...resp.data,
            data: (resp.data?.data as TicketWithHighlightsResponse[]).map(
                mergeEntitiesWithHighlights,
            ) as PickedTicketWithHighlights[],
        },
    }))
