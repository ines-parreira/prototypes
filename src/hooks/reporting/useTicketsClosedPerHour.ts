import {
    Metric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {StatsFilters} from 'models/stat/types'

export const useTicketsClosedPerHour = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => {
    const closedTickets = useClosedTicketsMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone
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
