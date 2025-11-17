import {
    fetchClosedTicketsTrend,
    fetchZeroTouchTicketsTrend,
    useZeroTouchTicketsTrend,
} from 'domains/reporting/hooks/metricTrends'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useZeroTouchTicketsMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
): MetricTrend => {
    const { data, isFetching, isError } = useZeroTouchTicketsTrend(
        statsFilters,
        timezone,
    )

    return {
        isFetching,
        isError: isError,
        data: isFetching
            ? undefined
            : {
                  value: data?.value || null,
                  prevValue: data?.prevValue || null,
              },
    }
}

export const fetchZeroTouchTicketsMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string,
): Promise<MetricTrend> =>
    Promise.all([
        fetchZeroTouchTicketsTrend(statsFilters, timezone),
        fetchClosedTicketsTrend(statsFilters, timezone),
    ])
        .then(([zeroTouchTicketsTrend]) => {
            return {
                isFetching: false,
                isError: false,
                data: {
                    value: zeroTouchTicketsTrend?.data?.value || null,
                    prevValue: zeroTouchTicketsTrend?.data?.prevValue || null,
                },
            }
        })
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: undefined,
            }
        })
