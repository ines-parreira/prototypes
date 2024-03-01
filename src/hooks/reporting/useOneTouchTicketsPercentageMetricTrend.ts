import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {useClosedTicketsTrend, useOneTouchTicketsTrend} from './metricTrends'

const calculatePercentage = (x: number, y: number) => (x / y) * 100

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
