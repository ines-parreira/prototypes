import { useMemo } from 'react'

import {
    fetchOnlineTimeMetric,
    fetchTicketsRepliedMetric,
    Metric,
    useOnlineTimeMetric,
    useTicketsRepliedMetric,
} from 'hooks/reporting/metrics'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import { StatsFilters } from 'models/stat/types'

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
