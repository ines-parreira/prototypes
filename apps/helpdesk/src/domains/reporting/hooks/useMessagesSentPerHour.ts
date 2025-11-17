import { useMemo } from 'react'

import { calculateTotalCapacity } from 'domains/reporting/hooks/helpers'
import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchMessagesSentMetric,
    fetchOnlineTimeMetric,
    useMessagesSentMetric,
    useOnlineTimeMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import type {
    AgentOnlyFilters,
    Period,
    StatsFilters,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

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

export const useMessagesSentPerHourPerAgentTotalCapacity = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const messagesSent = useMessagesSentMetricPerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )
    const allMessagesSent = messagesSent.data?.allData

    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )
    const onlineTimeDataPerAllAgents = onlineTime.data?.allData

    const data = useMemo(
        () =>
            calculateTotalCapacity(
                allMessagesSent,
                onlineTimeDataPerAllAgents,
                HelpdeskMessageDimension.SenderId,
                HelpdeskMessageMeasure.MessageCount,
            ),
        [allMessagesSent, onlineTimeDataPerAllAgents],
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

export const fetchMessagesSentPerHourPerAgentTotalCapacity = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchMessagesSentMetricPerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimePerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([messagesSent, onlineTime]) => ({
            data: calculateTotalCapacity(
                messagesSent.data?.allData,
                onlineTime.data?.allData,
                HelpdeskMessageDimension.SenderId,
                HelpdeskMessageMeasure.MessageCount,
            ),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: { value: null },
            isFetching: false,
            isError: true,
        }))
}
