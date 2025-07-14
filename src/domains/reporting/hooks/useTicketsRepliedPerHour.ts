import { useMemo } from 'react'

import { calculateTotalCapacity } from 'domains/reporting/hooks/helpers'
import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import {
    fetchOnlineTimeMetric,
    fetchTicketsRepliedMetric,
    Metric,
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
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'

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

    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const onlineTimeDataPerAllAgents = onlineTime.data?.allData

    const data = useMemo(
        () =>
            calculateTotalCapacity(
                allRepliedTickets,
                onlineTimeDataPerAllAgents,
                TicketDimension.MessageSenderId,
                HelpdeskMessageMeasure.TicketCount,
            ),
        [onlineTimeDataPerAllAgents, allRepliedTickets],
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
                TicketDimension.MessageSenderId,
                HelpdeskMessageMeasure.TicketCount,
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
