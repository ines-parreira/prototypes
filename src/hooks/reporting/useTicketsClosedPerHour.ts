import {
    Metric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const useTicketsClosedPerHour = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
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
