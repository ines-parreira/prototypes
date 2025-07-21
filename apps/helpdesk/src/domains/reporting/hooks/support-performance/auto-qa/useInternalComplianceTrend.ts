import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { internalComplianceQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useInternalComplianceTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        internalComplianceQueryFactory(filters, timezone),
        internalComplianceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchInternalComplianceTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        internalComplianceQueryFactory(filters, timezone),
        internalComplianceQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
