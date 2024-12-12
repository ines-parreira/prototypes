import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {internalComplianceQueryFactory} from 'models/reporting/queryFactories/auto-qa/internalComplianceQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useInternalComplianceTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        internalComplianceQueryFactory(filters, timezone),
        internalComplianceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
