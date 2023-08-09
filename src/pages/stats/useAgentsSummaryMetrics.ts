import {useMemo} from 'react'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {
    useClosedTicketsMetric,
    useCustomerSatisfactionMetric,
    useFirstResponseTimeMetric,
    useResolutionTimeMetric,
    useTicketsRepliedMetric,
    useMessagesSentMetric,
} from 'hooks/reporting/metrics'

export function useAgentsSummaryMetrics() {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const customerSatisfactionMetric = useCustomerSatisfactionMetric(
        pageStatsFilters,
        userTimezone
    )

    const percentageOfClosedTicketsMetric = useClosedTicketsMetric(
        pageStatsFilters,
        userTimezone
    )

    const closedTicketsMetric = useClosedTicketsMetric(
        pageStatsFilters,
        userTimezone
    )
    const firstResponseTimeMetric = useFirstResponseTimeMetric(
        pageStatsFilters,
        userTimezone
    )
    const messagesSentMetric = useMessagesSentMetric(
        pageStatsFilters,
        userTimezone
    )
    const resolutionTimeMetric = useResolutionTimeMetric(
        pageStatsFilters,
        userTimezone
    )
    const ticketsRepliedMetric = useTicketsRepliedMetric(
        pageStatsFilters,
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
        period: pageStatsFilters.period,
    }
}
