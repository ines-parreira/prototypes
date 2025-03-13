import { useMemo } from 'react'

import {
    fetchMessagesSentMetric,
    fetchOnlineTimeMetric,
    Metric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    AgentOnlyFilters,
    Period,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'models/stat/types'

export const periodAndAgentOnlyFilters = (statsFilters: {
    period: Period
    agents?: StatsFiltersWithLogicalOperator['agents']
}): AgentOnlyFilters<StatsFiltersWithLogicalOperator['agents']> => ({
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

const formatResult = (messagesSent: Metric, onlineTime: Metric) => {
    let metricValue: number | null = null

    if (messagesSent.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            messagesSent.data.value,
            onlineTime.data.value,
        )
    }

    return {
        value: metricValue,
    }
}

export const useMessagesSentPerHour = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const messagesSent = useMessagesSentMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const data = useMemo(
        () => formatResult(messagesSent, onlineTime),
        [messagesSent, onlineTime],
    )

    return {
        isFetching: messagesSent.isFetching || onlineTime.isFetching,
        isError: messagesSent.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchMessagesSentPerHour = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchMessagesSentMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimeMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([messagesSent, onlineTime]) => ({
            data: formatResult(messagesSent, onlineTime),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: { value: null },
            isFetching: false,
            isError: false,
        }))
}
