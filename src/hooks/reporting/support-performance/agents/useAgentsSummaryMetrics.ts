import { useMemo } from 'react'

import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import { useOneTouchTicketsPercentageMetricTrend } from 'hooks/reporting/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useMessagesSentPerHour } from 'hooks/reporting/useMessagesSentPerHour'
import { useTicketsClosedPerHour } from 'hooks/reporting/useTicketsClosedPerHour'
import { useTicketsRepliedPerHour } from 'hooks/reporting/useTicketsRepliedPerHour'

import { useZeroTouchTicketsMetricTrend } from '../overview/useZeroTouchTicketsMetricTrend'

export function useAgentsSummaryMetrics() {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()
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
    const messagesSentMetric = useMessagesSentMetric(
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
        summaryData: {
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
    }
}
