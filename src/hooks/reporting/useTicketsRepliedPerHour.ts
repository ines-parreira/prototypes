import {
    Metric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'

export const useTicketsRepliedPerHour = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const repliedTickets = useTicketsRepliedMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )

    let metricValue: number | null = null

    if (repliedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            repliedTickets.data.value,
            onlineTime.data.value
        )
    }

    return {
        isFetching: repliedTickets.isFetching || onlineTime.isFetching,
        isError: repliedTickets.isError || onlineTime.isError,
        data: {
            value: metricValue,
        },
    }
}
