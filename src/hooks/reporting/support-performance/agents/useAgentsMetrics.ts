import { useMemo } from 'react'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { usePercentageOfClosedTicketsMetricPerAgent } from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { useOneTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useMessagesSentPerHourPerAgent } from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import { useTicketsClosedPerHourPerAgent } from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import { useTicketsRepliedPerHourPerAgent } from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'

export function useAgentsMetrics() {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()

    const customerSatisfactionMetric = useCustomerSatisfactionMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const percentageOfClosedTicketsMetric =
        usePercentageOfClosedTicketsMetricPerAgent(
            cleanStatsFilters,
            userTimezone,
        )
    const closedTicketsMetric = useClosedTicketsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const medianFirstResponseTimeMetric =
        useMedianFirstResponseTimeMetricPerAgent(
            cleanStatsFilters,
            userTimezone,
        )
    const messagesSentMetric = useMessagesSentMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const medianResolutionTimeMetric = useMedianResolutionTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const ticketsRepliedMetric = useTicketsRepliedMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const oneTouchTicketsMetric = useOneTouchTicketsPercentageMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const zeroTouchTicketsMetric = useZeroTouchTicketsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const repliedTicketsPerHourMetric = useTicketsRepliedPerHourPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const onlineTimeMetric = useOnlineTimePerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesSentPerHourMetric = useMessagesSentPerHourPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const closedTicketsPerHourMetric = useTicketsClosedPerHourPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const ticketHandleTimeMetric = useTicketAverageHandleTimePerAgent(
        cleanStatsFilters,
        userTimezone,
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
            zeroTouchTicketsMetric,
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
        zeroTouchTicketsMetric,
        repliedTicketsPerHourMetric,
        onlineTimeMetric,
        messagesSentPerHourMetric,
        closedTicketsPerHourMetric,
        ticketHandleTimeMetric,
    ])

    return {
        reportData: {
            customerSatisfactionMetric,
            percentageOfClosedTicketsMetric,
            closedTicketsMetric,
            medianFirstResponseTimeMetric,
            messagesSentMetric,
            medianResolutionTimeMetric,
            ticketsRepliedMetric,
            oneTouchTicketsMetric,
            zeroTouchTicketsMetric,
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
