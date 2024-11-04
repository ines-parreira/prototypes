import {
    Metric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {StatsFilters} from 'models/stat/types'

export const useTicketsRepliedPerHour = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => {
    const repliedTickets = useTicketsRepliedMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone
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
