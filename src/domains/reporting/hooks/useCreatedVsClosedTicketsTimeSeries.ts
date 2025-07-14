import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import { formatTimeSeriesData } from 'domains/reporting/pages/common/utils'
import {
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
} from 'domains/reporting/services/constants'

export const useCreatedVsClosedTicketsTimeSeries = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const closedTicketsTimeSeries = useTicketsClosedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )
    const createdTicketsTimeSeries = useTicketsCreatedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )
    const closedTickets = formatTimeSeriesData(
        closedTicketsTimeSeries.data,
        TICKETS_CLOSED_LABEL,
        granularity,
    )

    const createdTickets = formatTimeSeriesData(
        createdTicketsTimeSeries.data,
        TICKETS_CREATED_LABEL,
        granularity,
    )

    return {
        timeSeries: [...createdTickets, ...closedTickets],
        isLoading: !closedTicketsTimeSeries.data || !createdTicketsTimeSeries,
    }
}
