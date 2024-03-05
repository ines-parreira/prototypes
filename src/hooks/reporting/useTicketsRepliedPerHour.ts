import {
    Metric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMessagesPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const useTicketsRepliedPerHour = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
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
        metricValue = calculateMessagesPerHour(
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
