import { useMemo } from 'react'

import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMedianResponseTimeMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'domains/reporting/hooks/metrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useZeroTouchTicketsMetricTrend } from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMessagesSentPerHour } from 'domains/reporting/hooks/useMessagesSentPerHour'
import { useTicketsClosedPerHour } from 'domains/reporting/hooks/useTicketsClosedPerHour'
import { useTicketsRepliedPerHour } from 'domains/reporting/hooks/useTicketsRepliedPerHour'

export function useAgentsAverageMetrics() {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const customerSatisfactionMetric = useCustomerSatisfactionMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const percentageOfClosedTicketsMetric = useClosedTicketsMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const closedTicketsMetric = useClosedTicketsMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const medianFirstResponseTimeMetric = useMedianFirstResponseTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const medianResponseTimeMetric = useMedianResponseTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesSentMetric = useMessagesSentMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesReceivedMetric = useMessagesReceivedMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const medianResolutionTimeMetric = useMedianResolutionTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const ticketsRepliedMetric = useTicketsRepliedMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const oneTouchTicketsMetric = useOneTouchTicketsPercentageMetricTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const zeroTouchTicketsMetric = useZeroTouchTicketsMetricTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const repliedTicketsPerHourMetric = useTicketsRepliedPerHour(
        cleanStatsFilters,
        userTimezone,
    )
    const onlineTimeMetric = useOnlineTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )
    const messagesSentPerHourMetric = useMessagesSentPerHour(
        cleanStatsFilters,
        userTimezone,
    )
    const closedTicketsPerHourMetric = useTicketsClosedPerHour(
        cleanStatsFilters,
        userTimezone,
    )
    const ticketHandleTimeMetric = useTicketAverageHandleTimeMetric(
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
        averageData: {
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
    }
}
