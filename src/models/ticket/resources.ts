import client from '../api/resources'
import {
    ApiPaginationParams,
    ApiListResponseCursorPagination,
} from '../api/types'
import {Ticket} from '../ticket/types'

export const fetchTicketsByRuleId = async (
    ruleId: number,
    params: ApiPaginationParams
): Promise<ApiListResponseCursorPagination<Ticket[]>> => {
    const res = await client.get(`/api/tickets`, {
        params: {...params, rule_id: ruleId},
    })
    return res.data as ApiListResponseCursorPagination<Ticket[]>
}
