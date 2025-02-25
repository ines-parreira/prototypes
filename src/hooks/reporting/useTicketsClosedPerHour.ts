import { useMemo } from 'react'

import {
    fetchClosedTicketsMetric,
    fetchOnlineTimeMetric,
    Metric,
    useClosedTicketsMetric,
    useOnlineTimeMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
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
