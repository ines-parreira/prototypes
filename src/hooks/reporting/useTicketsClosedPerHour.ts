import {
    Metric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'

export const useTicketsClosedPerHour = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const closedTickets = useClosedTicketsMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )

    let metricValue: number | null = null

    if (closedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            closedTickets.data.value,
            onlineTime.data.value
        )
    }

    return {
        isFetching: closedTickets.isFetching || onlineTime.isFetching,
        isError: closedTickets.isError || onlineTime.isError,
        data: {
            value: metricValue,
        },
    }
}
