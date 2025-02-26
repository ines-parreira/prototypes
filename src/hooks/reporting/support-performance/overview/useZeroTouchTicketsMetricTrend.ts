import {
    fetchClosedTicketsTrend,
    fetchZeroTouchTicketsTrend,
    useZeroTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'

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
