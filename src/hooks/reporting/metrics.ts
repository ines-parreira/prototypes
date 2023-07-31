import {closedTicketsQueryFactory} from 'hooks/reporting/metricTrends'
import {useMetric} from 'hooks/reporting/useMetric'
import {StatsFilters} from 'models/stat/types'

export type Metric = {
    isFetching: boolean
    isError: boolean
    data?: {
        value: number | null
    }
}

export const useClosedTicketsMetric = (
    statsFilters: StatsFilters,
    timezone: string
): Metric => useMetric(closedTicketsQueryFactory(statsFilters, timezone))
