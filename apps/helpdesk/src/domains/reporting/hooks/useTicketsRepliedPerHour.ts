import { useMemo } from 'react'

import { calculateTotalCapacity } from 'domains/reporting/hooks/helpers'
import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchOnlineTimeMetric,
    fetchTicketsRepliedMetric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchOnlineTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { periodAndAgentOnlyFilters } from 'domains/reporting/hooks/useMessagesSentPerHour'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const formatResult = (repliedTickets: Metric, onlineTime: Metric) => {
    let metricValue: number | null = null

    if (repliedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            repliedTickets.data.value,
            onlineTime.data.value,
        )
    }

    return {
        value: metricValue,
    }
}

export const useTicketsRepliedPerHour = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const repliedTickets = useTicketsRepliedMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const data = useMemo(
        () => formatResult(repliedTickets, onlineTime),
        [onlineTime, repliedTickets],
    )

    return {
        isFetching: repliedTickets.isFetching || onlineTime.isFetching,
        isError: repliedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const useTicketsRepliedPerHourPerAgentTotalCapacity = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const repliedTickets = useTicketsRepliedMetricPerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const allRepliedTickets = repliedTickets.data?.allData
    const repliedTicketsDimension = repliedTickets.data?.dimensions?.[0] || ''
    const repliedTicketsMeasure = repliedTickets.data?.measures?.[0] || ''

    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const onlineTimeDataPerAllAgents = onlineTime.data?.allData
    const onlineTimeDimension = onlineTime.data?.dimensions?.[0] || ''
    const onlineTimeMeasure = onlineTime.data?.measures?.[0] || ''

    const data = useMemo(
        () =>
            calculateTotalCapacity(
                allRepliedTickets,
                onlineTimeDataPerAllAgents,
                repliedTicketsDimension,
                repliedTicketsMeasure,
                onlineTimeDimension,
                onlineTimeMeasure,
            ),
        [
            onlineTimeDataPerAllAgents,
            allRepliedTickets,
            repliedTicketsDimension,
            repliedTicketsMeasure,
            onlineTimeDimension,
            onlineTimeMeasure,
        ],
    )

    return {
        isFetching: repliedTickets.isFetching || onlineTime.isFetching,
        isError: repliedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchTicketsRepliedPerHour = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchTicketsRepliedMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimeMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([repliedTickets, onlineTime]) => ({
            data: formatResult(repliedTickets, onlineTime),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: { value: null },
            isFetching: false,
            isError: true,
        }))
}

export const fetchTicketsRepliedPerHourPerAgentTotalCapacity = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchTicketsRepliedMetricPerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimePerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([repliedTickets, onlineTime]) => ({
            data: calculateTotalCapacity(
                repliedTickets.data?.allData,
                onlineTime.data?.allData,
                repliedTickets.data?.dimensions?.[0] || '',
                repliedTickets.data?.measures?.[0] || '',
                onlineTime.data?.dimensions?.[0] || '',
                onlineTime.data?.measures?.[0] || '',
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
