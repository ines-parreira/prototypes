import useAppSelector from 'hooks/useAppSelector'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
} from 'services/reporting/constants'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
} from 'hooks/reporting/timeSeries'

export const useCreatedVsClosedTicketsTimeSeries = (
    isAnalyticsNewFilters = false
) => {
    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

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
