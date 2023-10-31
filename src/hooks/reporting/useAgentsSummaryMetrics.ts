import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useTicketsRepliedMetric,
    useMessagesSentMetric,
    useOneTouchTicketsMetric,
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
    const medianFirstResponseTimeMetric = useMedianFirstResponseTimeMetric(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentMetric = useMessagesSentMetric(
        cleanStatsFilters,
        userTimezone
    )
    const medianResolutionTimeMetric = useMedianResolutionTimeMetric(
        cleanStatsFilters,
        userTimezone
    )
    const ticketsRepliedMetric = useTicketsRepliedMetric(
        cleanStatsFilters,
        userTimezone
    )
    const oneTouchTicketsMetric = useOneTouchTicketsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const loading = useMemo(() => {
        return Object.values({
            customerSatisfactionMetric,
            percentageOfClosedTicketsMetric,
            closedTicketsMetric,
            medianFirstResponseTimeMetric,
            messagesSentMetric,
            medianResolutionTimeMetric,
            ticketsRepliedMetric,
            oneTouchTicketsMetric,
        }).some((metric) => metric.isFetching)
    }, [
        customerSatisfactionMetric,
        percentageOfClosedTicketsMetric,
        closedTicketsMetric,
        medianFirstResponseTimeMetric,
        messagesSentMetric,
        medianResolutionTimeMetric,
        ticketsRepliedMetric,
        oneTouchTicketsMetric,
    ])

    return {
        summaryData: {
            customerSatisfactionMetric,
            percentageOfClosedTicketsMetric,
            closedTicketsMetric,
            medianFirstResponseTimeMetric,
            messagesSentMetric,
            medianResolutionTimeMetric,
            ticketsRepliedMetric,
            oneTouchTicketsMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
