import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useFirstResponseTimeMetric,
    useResolutionTimeMetric,
    useTicketsRepliedMetric,
    useMessagesSentMetric,
} from 'hooks/reporting/metrics'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'

export function useAgentsSummaryMetrics() {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const customerSatisfactionMetric = useCustomerSatisfactionMetric(
        cleanStatsFilters,
        userTimezone
    )

    const percentageOfClosedTicketsMetric = useClosedTicketsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const closedTicketsMetric = useClosedTicketsMetric(
        cleanStatsFilters,
        userTimezone
    )
    const firstResponseTimeMetric = useFirstResponseTimeMetric(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentMetric = useMessagesSentMetric(
        cleanStatsFilters,
        userTimezone
    )
    const resolutionTimeMetric = useResolutionTimeMetric(
        cleanStatsFilters,
        userTimezone
    )
    const ticketsRepliedMetric = useTicketsRepliedMetric(
        cleanStatsFilters,
        userTimezone
    )

    const loading = useMemo(() => {
        return Object.values({
            customerSatisfactionMetric,
            percentageOfClosedTicketsMetric,
            closedTicketsMetric,
            firstResponseTimeMetric,
            messagesSentMetric,
            resolutionTimeMetric,
            ticketsRepliedMetric,
        }).some((metric) => metric.isFetching)
    }, [
        customerSatisfactionMetric,
        percentageOfClosedTicketsMetric,
        closedTicketsMetric,
        firstResponseTimeMetric,
        messagesSentMetric,
        resolutionTimeMetric,
        ticketsRepliedMetric,
    ])

    return {
        summaryData: {
            customerSatisfactionMetric,
            percentageOfClosedTicketsMetric,
            closedTicketsMetric,
            firstResponseTimeMetric,
            messagesSentMetric,
            resolutionTimeMetric,
            ticketsRepliedMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
