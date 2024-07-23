import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {resolvedTicketsQueryFactory} from 'models/reporting/queryFactories/auto-qa/resolvedTicketsQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useResolvedTicketsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolvedTicketsQueryFactory(filters, timezone),
        resolvedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
