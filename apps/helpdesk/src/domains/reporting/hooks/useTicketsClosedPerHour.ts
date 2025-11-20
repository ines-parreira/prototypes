import { useMemo } from 'react'

import { calculateTotalCapacity } from 'domains/reporting/hooks/helpers'
import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetric,
    fetchOnlineTimeMetric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    useClosedTicketsMetricPerAgent,
    useOnlineTimePerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { periodAndAgentOnlyFilters } from 'domains/reporting/hooks/useMessagesSentPerHour'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

const formatResult = (closedTickets: Metric, onlineTime: Metric) => {
    let metricValue: number | null = null

    if (closedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            closedTickets.data.value,
            onlineTime.data.value,
        )
    }

    return {
        value: metricValue,
    }
}

export const useTicketsClosedPerHour = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const closedTickets = useClosedTicketsMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )
    const onlineTime = useOnlineTimeMetric(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const data = useMemo(
        () => formatResult(closedTickets, onlineTime),
        [closedTickets, onlineTime],
    )

    return {
        isFetching: closedTickets.isFetching || onlineTime.isFetching,
        isError: closedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const useTicketsClosedPerHourPerAgentTotalCapacity = (
    statsFilters: StatsFilters,
    timezone: string,
): Metric => {
    const closedTickets = useClosedTicketsMetricPerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const allClosedTickets = closedTickets.data?.allData
    const closedTicketsDimension = closedTickets.data?.dimensions?.[0] || ''
    const closedTicketsMeasure = closedTickets.data?.measures?.[0] || ''

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
                allClosedTickets,
                onlineTimeDataPerAllAgents,
                closedTicketsDimension,
                closedTicketsMeasure,
                onlineTimeDimension,
                onlineTimeMeasure,
            ),
        [
            allClosedTickets,
            onlineTimeDataPerAllAgents,
            closedTicketsDimension,
            closedTicketsMeasure,
            onlineTimeDimension,
            onlineTimeMeasure,
        ],
    )

    return {
        isFetching: closedTickets.isFetching || onlineTime.isFetching,
        isError: closedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchTicketsClosedPerHour = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchClosedTicketsMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimeMetric(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([closedTickets, onlineTime]) => ({
            data: formatResult(closedTickets, onlineTime),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: { value: null },
            isError: true,
            isFetching: false,
        }))
}

export const fetchTicketsClosedPerHourPerAgentTotalCapacity = async (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<Metric> => {
    return Promise.all([
        fetchClosedTicketsMetricPerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
        fetchOnlineTimePerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
        ),
    ])
        .then(([closedTickets, onlineTime]) => ({
            data: calculateTotalCapacity(
                closedTickets.data?.allData,
                onlineTime.data?.allData,
                closedTickets.data?.dimensions?.[0] || '',
                closedTickets.data?.measures?.[0] || '',
                onlineTime.data?.dimensions?.[0] || '',
                onlineTime.data?.measures?.[0] || '',
            ),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: { value: null },
            isError: true,
            isFetching: false,
        }))
}
