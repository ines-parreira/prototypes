import {
    fetchClosedTicketsTrend,
    fetchZeroTouchTicketsTrend,
    useClosedTicketsTrend,
    useZeroTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {calculatePercentage} from 'utils/reporting'

const formatData = (
    zeroTouchTicketsTrend: MetricTrend,
    closedTicketsTrend: MetricTrend
) => {
    let metricValue: number | null = null
    let prevMetricValue: number | null = null

    if (closedTicketsTrend.data?.value && zeroTouchTicketsTrend.data?.value) {
        metricValue = calculatePercentage(
            zeroTouchTicketsTrend.data.value,
            closedTicketsTrend.data.value
        )
    }

    if (
        closedTicketsTrend.data?.prevValue &&
        zeroTouchTicketsTrend.data?.prevValue
    ) {
        prevMetricValue = calculatePercentage(
            zeroTouchTicketsTrend.data.prevValue,
            closedTicketsTrend.data.prevValue
        )
    }

    return {
        value: metricValue,
        prevValue: prevMetricValue,
    }
}

export const useZeroTouchTicketsPercentageMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string
): MetricTrend => {
    const zeroTouchTicketsTrend = useZeroTouchTicketsTrend(
        statsFilters,
        timezone
    )
    const closedTicketsTrend = useClosedTicketsTrend(statsFilters, timezone)

    const data = formatData(zeroTouchTicketsTrend, closedTicketsTrend)

    const isFetching =
        zeroTouchTicketsTrend.isFetching || closedTicketsTrend.isFetching

    return {
        isFetching,
        isError: zeroTouchTicketsTrend.isError || closedTicketsTrend.isError,
        data: isFetching ? undefined : data,
    }
}

export const fetchZeroTouchTicketsPercentageMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<MetricTrend> =>
    Promise.all([
        fetchZeroTouchTicketsTrend(statsFilters, timezone),
        fetchClosedTicketsTrend(statsFilters, timezone),
    ])
        .then(([zeroTouchTicketsTrend, closedTicketsTrend]) => {
            return {
                isFetching: false,
                isError: false,
                data: formatData(zeroTouchTicketsTrend, closedTicketsTrend),
            }
        })
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: undefined,
            }
        })
