import {useMemo} from 'react'
import {useMessagesSentPerHourPerAgent} from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import {useTicketsClosedPerHourPerAgent} from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import {useTicketsRepliedPerHourPerAgent} from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import {User} from 'config/types/user'
import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/usePercentageOfClosedTicketsMetricPerAgent'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import useAppSelector from 'hooks/useAppSelector'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

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
    const repliedTicketsPerHourMetric = useTicketsRepliedPerHourPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const onlineTimeMetric = useOnlineTimePerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentPerHourMetric = useMessagesSentPerHourPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const closedTicketsPerHourMetric = useTicketsClosedPerHourPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const ticketHandleTimeMetric = useTicketAverageHandleTimePerAgent(
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
            repliedTicketsPerHourMetric,
            onlineTimeMetric,
            messagesSentPerHourMetric,
            closedTicketsPerHourMetric,
            ticketHandleTimeMetric,
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
        repliedTicketsPerHourMetric,
        onlineTimeMetric,
        messagesSentPerHourMetric,
        closedTicketsPerHourMetric,
        ticketHandleTimeMetric,
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
            repliedTicketsPerHourMetric,
            onlineTimeMetric,
            messagesSentPerHourMetric,
            closedTicketsPerHourMetric,
            ticketHandleTimeMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
