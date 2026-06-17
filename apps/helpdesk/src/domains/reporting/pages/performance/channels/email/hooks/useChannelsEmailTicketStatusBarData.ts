import type { ChartDataItem } from '@repo/reporting'

import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import { channelsEmailClosedTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsClosed'
import { channelsEmailCreatedTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { channelsEmailOpenTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsOpen'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const CREATED_TICKETS_LABEL = 'Created'
const OPEN_TICKETS_LABEL = 'Open'
const CLOSED_TICKETS_LABEL = 'Closed'

export const useChannelsEmailTicketStatusBarData = (
    filters: StatsFilters,
    timezone: string,
): { data: ChartDataItem[]; isLoading: boolean; isError: boolean } => {
    const created = useStatsMetric(
        channelsEmailCreatedTicketsValueQueryFactoryV2({ filters, timezone }),
    )
    const open = useStatsMetric(
        channelsEmailOpenTicketsValueQueryFactoryV2({ filters, timezone }),
    )
    const closed = useStatsMetric(
        channelsEmailClosedTicketsValueQueryFactoryV2({ filters, timezone }),
    )

    return {
        data: [
            { name: CREATED_TICKETS_LABEL, value: created.data?.value ?? null },
            { name: OPEN_TICKETS_LABEL, value: open.data?.value ?? null },
            { name: CLOSED_TICKETS_LABEL, value: closed.data?.value ?? null },
        ],
        isLoading: created.isFetching || open.isFetching || closed.isFetching,
        isError: created.isError || open.isError || closed.isError,
    }
}

export const fetchChannelsEmailTicketStatusRows = async (
    filters: StatsFilters,
    timezone: string,
): Promise<{ name: string; value: number | null }[]> => {
    const [created, open, closed] = await Promise.all([
        fetchStatsMetric(
            channelsEmailCreatedTicketsValueQueryFactoryV2({
                filters,
                timezone,
            }),
        ),
        fetchStatsMetric(
            channelsEmailOpenTicketsValueQueryFactoryV2({ filters, timezone }),
        ),
        fetchStatsMetric(
            channelsEmailClosedTicketsValueQueryFactoryV2({
                filters,
                timezone,
            }),
        ),
    ])

    return [
        { name: CREATED_TICKETS_LABEL, value: created.data?.value ?? null },
        { name: OPEN_TICKETS_LABEL, value: open.data?.value ?? null },
        { name: CLOSED_TICKETS_LABEL, value: closed.data?.value ?? null },
    ]
}
