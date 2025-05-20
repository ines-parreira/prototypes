import { useMemo } from 'react'

import { calculateTotalCapacity } from 'hooks/reporting/helpers'
import { calculateMetricPerHour } from 'hooks/reporting/metricCalculations'
import {
    fetchClosedTicketsMetric,
    fetchOnlineTimeMetric,
    Metric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    useClosedTicketsMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { periodAndAgentOnlyFilters } from 'hooks/reporting/useMessagesSentPerHour'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { StatsFilters } from 'models/stat/types'

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

    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
    )

    const onlineTimeDataPerAllAgents = onlineTime.data?.allData

    const data = useMemo(
        () =>
            calculateTotalCapacity(
                allClosedTickets,
                onlineTimeDataPerAllAgents,
                TicketDimension.AssigneeUserId,
                TicketMeasure.TicketCount,
            ),
        [allClosedTickets, onlineTimeDataPerAllAgents],
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
                TicketDimension.AssigneeUserId,
                TicketMeasure.TicketCount,
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
