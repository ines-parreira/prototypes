import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {calculatePercentage} from 'utils/reporting'
import {
    useClosedTicketsTrend,
    useOneTouchTicketsTrend,
} from 'hooks/reporting/metricTrends'

export const useOneTouchTicketsPercentageMetricTrend = (
    statsFilters: StatsFilters,
    timezone: string
): MetricTrend => {
    const {data, isFetching, isError} = useOneTouchTicketsTrend(
        statsFilters,
        timezone
    )

    const closedTicketsTrend = useClosedTicketsTrend(statsFilters, timezone)

    let metricValue: number | null = null
    let prevMetricValue: number | null = null

    if (closedTicketsTrend.data?.value && data?.value) {
        metricValue = calculatePercentage(
            data.value,
            closedTicketsTrend.data.value
        )
    }

    if (closedTicketsTrend.data?.prevValue && data?.prevValue) {
        prevMetricValue = calculatePercentage(
            data.prevValue,
            closedTicketsTrend.data.prevValue
        )
    }

    return {
        isFetching: isFetching || closedTicketsTrend.isFetching,
        isError: isError || closedTicketsTrend.isError,
        data:
            metricValue && prevMetricValue
                ? {
                      value: metricValue,
                      prevValue: prevMetricValue,
                  }
                : undefined,
    }
}
