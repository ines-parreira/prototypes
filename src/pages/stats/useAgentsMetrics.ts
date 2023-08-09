import {useMemo} from 'react'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {User} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {
    useCustomerSatisfactionMetricPerAgent,
    useClosedTicketsMetricPerAgent,
    useFirstResponseTimeMetricPerAgent,
    useMessagesSentMetricPerAgent,
    useResolutionTimeMetricPerAgent,
    useTicketsRepliedMetricPerAgent,
    usePercentageOfClosedTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'

export function useAgentsMetrics() {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const agents = useAppSelector<User[]>(getSortedAgents)

    const customerSatisfactionMetric = useCustomerSatisfactionMetricPerAgent(
        pageStatsFilters,
        userTimezone
    )

    const percentageOfClosedTicketsMetric =
        usePercentageOfClosedTicketsMetricPerAgent(
            pageStatsFilters,
            userTimezone
        )

    const closedTicketsMetric = useClosedTicketsMetricPerAgent(
        pageStatsFilters,
        userTimezone
    )
    const firstResponseTimeMetric = useFirstResponseTimeMetricPerAgent(
        pageStatsFilters,
        userTimezone
    )
    const messagesSentMetric = useMessagesSentMetricPerAgent(
        pageStatsFilters,
        userTimezone
    )
    const resolutionTimeMetric = useResolutionTimeMetricPerAgent(
        pageStatsFilters,
        userTimezone
    )
    const ticketsRepliedMetric = useTicketsRepliedMetricPerAgent(
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
        reportData: {
            agents,
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
