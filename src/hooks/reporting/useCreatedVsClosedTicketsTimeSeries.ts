import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
} from 'services/reporting/constants'

export const useCreatedVsClosedTicketsTimeSeries = () => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const closedTicketsTimeSeries = useTicketsClosedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )
    const createdTicketsTimeSeries = useTicketsCreatedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )
    const closedTickets = formatTimeSeriesData(
        closedTicketsTimeSeries.data,
        TICKETS_CLOSED_LABEL,
        granularity
    )

    const createdTickets = formatTimeSeriesData(
        createdTicketsTimeSeries.data,
        TICKETS_CREATED_LABEL,
        granularity
    )

    return {
        timeSeries: [...createdTickets, ...closedTickets],
        isLoading: !closedTicketsTimeSeries.data || !createdTicketsTimeSeries,
    }
}
