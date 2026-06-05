import { useMemo } from 'react'

import { TicketStatus } from 'business/types/ticket'
import { getTicketViewField, getTicketViewFieldPath } from 'config/views'
import { useStatsViewFilters } from 'domains/reporting/pages/common/utils'
import { ViewField } from 'models/view/types'
import { EqualityOperator } from 'state/rules/types'
import type { ViewFilter } from 'state/views/types'

const ASSIGNEE_FILTER_LEFT = getTicketViewFieldPath(
    getTicketViewField(ViewField.Assignee),
)

const STATUS_FILTER: ViewFilter = {
    left: getTicketViewFieldPath(getTicketViewField(ViewField.Status)),
    operator: EqualityOperator.Eq,
    right: JSON.stringify(TicketStatus.Open),
}

type OpenTicketsViewLinks = {
    /** Filters for all of the agent's open tickets. */
    openTicketsFilters: ViewFilter[]
    /** Filters for the agent's open tickets on a single channel. */
    getChannelFilters: (channelSlug: string) => ViewFilter[]
}

/**
 * Builds the ticket-view filters that link an agent's open-ticket counts to the
 * filtered tickets list — the total (assignee + open + base filters) and one
 * per channel. Mirrors the legacy `TicketDetailsStat` link behaviour.
 */
export function useOpenTicketsViewLinks(agentId: number): OpenTicketsViewLinks {
    const periodFilterLeft = getTicketViewFieldPath(
        getTicketViewField(ViewField.Closed),
    )
    const statsViewFilters = useStatsViewFilters(periodFilterLeft)
    const channelFilterLeft = getTicketViewFieldPath(
        getTicketViewField(ViewField.Channel),
    )

    return useMemo(() => {
        const assigneeFilter: ViewFilter = {
            left: ASSIGNEE_FILTER_LEFT,
            operator: EqualityOperator.Eq,
            right: agentId,
        }
        const baseFilters = statsViewFilters.filter(
            (filter) =>
                filter.left !== periodFilterLeft &&
                filter.left !== ASSIGNEE_FILTER_LEFT,
        )
        const openTicketsFilters: ViewFilter[] = [
            assigneeFilter,
            STATUS_FILTER,
            ...baseFilters,
        ]
        const getChannelFilters = (channelSlug: string): ViewFilter[] => [
            assigneeFilter,
            STATUS_FILTER,
            {
                left: channelFilterLeft,
                operator: EqualityOperator.Eq,
                right: JSON.stringify(channelSlug),
            },
            ...baseFilters.filter(
                (filter) => filter.left !== channelFilterLeft,
            ),
        ]
        return { openTicketsFilters, getChannelFilters }
    }, [agentId, statsViewFilters, periodFilterLeft, channelFilterLeft])
}
