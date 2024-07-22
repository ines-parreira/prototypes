import {
    Metric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import useAppSelector from 'hooks/useAppSelector'
import {
    AgentOnlyFilters,
    Period,
    LegacyStatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const periodAndAgentOnlyFilters = (statsFilters: {
    period: Period
    agents?:
        | LegacyStatsFilters['agents']
        | StatsFiltersWithLogicalOperator['agents']
}): AgentOnlyFilters<
    LegacyStatsFilters['agents'] | StatsFiltersWithLogicalOperator['agents']
> => ({
    period: statsFilters.period,
    ...(statsFilters?.agents
        ? {
              agents: statsFilters?.agents,
          }
        : {}),
})

const secondsToHours = (s: number) => s / 60 / 60

export const calculateMetricPerHour = (metric: number, seconds: number) =>
    seconds === 0 ? 0 : metric / secondsToHours(seconds)

export const useMessagesSentPerHour = (): Metric => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const messagesSent = useMessagesSentMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(cleanStatsFilters),
        userTimezone
    )

    let metricValue: number | null = null

    if (messagesSent.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            messagesSent.data.value,
            onlineTime.data.value
        )
    }

    return {
        isFetching: messagesSent.isFetching || onlineTime.isFetching,
        isError: messagesSent.isError || onlineTime.isError,
        data: {
            value: metricValue,
        },
    }
}
