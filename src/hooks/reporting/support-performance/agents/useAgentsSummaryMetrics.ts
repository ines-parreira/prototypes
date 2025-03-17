import { useMemo } from 'react'

import {
    useAverageResponseTimeMetric,
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMessagesReceivedMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useMessagesSentPerHour } from 'hooks/reporting/useMessagesSentPerHour'
import { useTicketsClosedPerHour } from 'hooks/reporting/useTicketsClosedPerHour'
import { useTicketsRepliedPerHour } from 'hooks/reporting/useTicketsRepliedPerHour'

import { useZeroTouchTicketsMetricTrend } from '../overview/useZeroTouchTicketsMetricTrend'

export function useAgentsSummaryMetrics() {
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
    const averageResponseTimeMetric = useAverageResponseTimeMetric(
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
            averageResponseTimeMetric,
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
        averageResponseTimeMetric,
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
        summaryData: {
            averageResponseTimeMetric,
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
