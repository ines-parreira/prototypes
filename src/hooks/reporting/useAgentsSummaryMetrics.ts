import {useMemo} from 'react'

import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useMedianFirstResponseTimeMetric,
    useMedianResolutionTimeMetric,
    useTicketsRepliedMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
    useTicketAverageHandleTimeMetric,
} from 'hooks/reporting/metrics'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useMessagesSentPerHour} from 'hooks/reporting/useMessagesSentPerHour'
import {useOneTouchTicketsPercentageMetricTrend} from 'hooks/reporting/useOneTouchTicketsPercentageMetricTrend'
import {useTicketsClosedPerHour} from 'hooks/reporting/useTicketsClosedPerHour'
import {useTicketsRepliedPerHour} from 'hooks/reporting/useTicketsRepliedPerHour'

export function useAgentsSummaryMetrics() {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
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
    const oneTouchTicketsMetric = useOneTouchTicketsPercentageMetricTrend(
        cleanStatsFilters,
        userTimezone
    )
    const repliedTicketsPerHourMetric = useTicketsRepliedPerHour()
    const onlineTimeMetric = useOnlineTimeMetric(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentPerHourMetric = useMessagesSentPerHour()
    const closedTicketsPerHourMetric = useTicketsClosedPerHour()
    const ticketHandleTimeMetric = useTicketAverageHandleTimeMetric(
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
        summaryData: {
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
    }
}
