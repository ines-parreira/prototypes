import {useGetReporting} from 'models/reporting/queries'
import {ReportingMeasure, TicketStateDimension} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

const STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes

export type TrendMetricQuery = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number
        prevValue: number
    }
}

export const useGetMetricTrend = (
    trendMeasure: ReportingMeasure,
    // todo: to implement StatsFilters -> query timeDimensions & filters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _filters: StatsFilters
): TrendMetricQuery => {
    const currentPeriod = useGetReporting<[number], number>(
        [
            {
                dimensions: [],
                // todo: compute timeDimensions from filters.period
                timeDimensions: [
                    {
                        dimension: TicketStateDimension.CreatedDatetime,
                        dateRange: ['2023-01-02'],
                    },
                ],
                measures: [trendMeasure],
                // todo: compute filters from StatFilters
                filters: [],
            },
        ],
        {
            staleTime: STALE_TIME_MS,
            select: (data) => {
                return data.data.data[0]
            },
        }
    )

    const prevPeriod = useGetReporting<[number], number>(
        [
            {
                dimensions: [],
                // todo: compute timeDimensions from filters.period
                timeDimensions: [
                    {
                        dimension: TicketStateDimension.CreatedDatetime,
                        dateRange: ['2023-01-01'],
                    },
                ],
                measures: [trendMeasure],
                filters: [], // todo: compute previous period filters
            },
        ],
        {
            staleTime: STALE_TIME_MS,
            select: (data) => {
                return data.data.data[0]
            },
        }
    )

    return {
        isFetching: currentPeriod.isFetching || prevPeriod.isFetching,
        isError: currentPeriod.isError || prevPeriod.isError,
        data:
            currentPeriod.data != null && prevPeriod.data != null
                ? {
                      value: currentPeriod.data,
                      prevValue: prevPeriod.data,
                  }
                : undefined,
    }
}
