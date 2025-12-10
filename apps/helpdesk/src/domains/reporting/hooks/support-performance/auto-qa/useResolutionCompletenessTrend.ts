import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { resolutionCompletenessQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { resolutionCompletenessQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useResolutionCompletenessTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        resolutionCompletenessQueryFactory(filters, timezone),
        resolutionCompletenessQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        resolutionCompletenessQueryV2Factory({ filters, timezone }),
        resolutionCompletenessQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchResolutionCompletenessTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        resolutionCompletenessQueryFactory(filters, timezone),
        resolutionCompletenessQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        resolutionCompletenessQueryV2Factory({ filters, timezone }),
        resolutionCompletenessQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
