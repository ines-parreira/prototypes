import { useMemo } from 'react'

import {
    useClosedTicketsMetricPerAgent,
    useCustomerSatisfactionMetricPerAgent,
    useMedianFirstResponseTimeMetricPerAgent,
    useMedianResolutionTimeMetricPerAgent,
    useMedianResponseTimeMetricPerAgent,
    useMessagesReceivedMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketAverageHandleTimePerAgent,
    useTicketsRepliedMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { usePercentageOfClosedTicketsMetricPerAgent } from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { useOneTouchTicketsPercentageMetricPerAgent } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricPerAgent'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useMessagesSentPerHourPerAgent } from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import { useTicketsClosedPerHourPerAgent } from 'hooks/reporting/useTicketsClosedPerHourPerAgent'
import { useTicketsRepliedPerHourPerAgent } from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'

export function useAgentsMetrics() {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

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
    const medianResponseTimeMetric = useMedianResponseTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesSentMetric = useMessagesSentMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesReceivedMetric = useMessagesReceivedMetricPerAgent(
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
            medianResponseTimeMetric,
            closedTicketsMetric,
            closedTicketsPerHourMetric,
            customerSatisfactionMetric,
            medianFirstResponseTimeMetric,
            medianResolutionTimeMetric,
            messagesReceivedMetric,
            messagesSentMetric,
            messagesSentPerHourMetric,
            oneTouchTicketsMetric,
            onlineTimeMetric,
            percentageOfClosedTicketsMetric,
            repliedTicketsPerHourMetric,
            ticketHandleTimeMetric,
            ticketsRepliedMetric,
            zeroTouchTicketsMetric,
        }).some((metric) => metric.isFetching)
    }, [
        medianResponseTimeMetric,
        closedTicketsMetric,
        closedTicketsPerHourMetric,
        customerSatisfactionMetric,
        medianFirstResponseTimeMetric,
        medianResolutionTimeMetric,
        messagesReceivedMetric,
        messagesSentMetric,
        messagesSentPerHourMetric,
        oneTouchTicketsMetric,
        onlineTimeMetric,
        percentageOfClosedTicketsMetric,
        repliedTicketsPerHourMetric,
        ticketHandleTimeMetric,
        ticketsRepliedMetric,
        zeroTouchTicketsMetric,
    ])

    return {
        reportData: {
            medianResponseTimeMetric,
            closedTicketsMetric,
            closedTicketsPerHourMetric,
            customerSatisfactionMetric,
            medianFirstResponseTimeMetric,
            medianResolutionTimeMetric,
            messagesReceivedMetric,
            messagesSentMetric,
            messagesSentPerHourMetric,
            oneTouchTicketsMetric,
            onlineTimeMetric,
            percentageOfClosedTicketsMetric,
            repliedTicketsPerHourMetric,
            ticketHandleTimeMetric,
            ticketsRepliedMetric,
            zeroTouchTicketsMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
