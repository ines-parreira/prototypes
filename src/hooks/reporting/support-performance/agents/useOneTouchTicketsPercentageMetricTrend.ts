import {
    fetchClosedTicketsTrend,
    fetchOneTouchTicketsTrend,
    useClosedTicketsTrend,
    useOneTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {calculatePercentage} from 'utils/reporting'

const formatData = (
    oneTouchTicketsTrend: MetricTrend,
    closedTicketsTrend: MetricTrend
) => {
    let metricValue: number | null = null
    let prevMetricValue: number | null = null

    if (closedTicketsTrend.data?.value && oneTouchTicketsTrend.data?.value) {
        metricValue = calculatePercentage(
            oneTouchTicketsTrend.data.value,
            closedTicketsTrend.data.value
        )
    }

    if (
        closedTicketsTrend.data?.prevValue &&
        oneTouchTicketsTrend.data?.prevValue
    ) {
        prevMetricValue = calculatePercentage(
            oneTouchTicketsTrend.data.prevValue,
            closedTicketsTrend.data.prevValue
        )
    }

    return {
        value: metricValue,
        prevValue: prevMetricValue,
    }
}

export const useOneTouchTicketsPercentageMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string
): MetricTrend => {
    const oneTouchTicketsTrend = useOneTouchTicketsTrend(statsFilters, timezone)
    const closedTicketsTrend = useClosedTicketsTrend(statsFilters, timezone)

    const data = formatData(oneTouchTicketsTrend, closedTicketsTrend)

    const isFetching =
        oneTouchTicketsTrend.isFetching || closedTicketsTrend.isFetching

    return {
        isFetching,
        isError: oneTouchTicketsTrend.isError || closedTicketsTrend.isError,
        data: isFetching ? undefined : data,
    }
}

export const fetchOneTouchTicketsPercentageMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string
): Promise<MetricTrend> =>
    Promise.all([
        fetchOneTouchTicketsTrend(statsFilters, timezone),
        fetchClosedTicketsTrend(statsFilters, timezone),
    ])
        .then(([oneTouchTicketsTrend, closedTicketsTrend]) => {
            return {
                isFetching: false,
                isError: false,
                data: formatData(oneTouchTicketsTrend, closedTicketsTrend),
            }
        })
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: undefined,
            }
        })
