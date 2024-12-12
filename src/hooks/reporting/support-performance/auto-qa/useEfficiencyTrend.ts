import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {efficiencyQueryFactory} from 'models/reporting/queryFactories/auto-qa/efficiencyQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useEfficiencyTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        efficiencyQueryFactory(filters, timezone),
        efficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
