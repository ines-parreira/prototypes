import {useMemo} from 'react'
import {User} from 'config/types/user'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/usePercentageOfClosedTicketsMetricPerAgent'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithTimezone,
    getSortedAgents,
} from 'state/ui/stats/agentPerformanceSlice'

export function useAgentsMetrics() {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const agents = useAppSelector<User[]>(getSortedAgents)

    const customerSatisfactionMetric = useCustomerSatisfactionMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const percentageOfClosedTicketsMetric =
        usePercentageOfClosedTicketsMetricPerAgent(
            cleanStatsFilters,
            userTimezone
        )

    const closedTicketsMetric = useClosedTicketsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const medianFirstResponseTimeMetric =
        useMedianFirstResponseTimeMetricPerAgent(
            cleanStatsFilters,
            userTimezone
        )
    const messagesSentMetric = useMessagesSentMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const medianResolutionTimeMetric = useMedianResolutionTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const ticketsRepliedMetric = useTicketsRepliedMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const oneTouchTicketsMetric = useOneTouchTicketsPercentageMetricPerAgent(
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
        reportData: {
            agents,
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
