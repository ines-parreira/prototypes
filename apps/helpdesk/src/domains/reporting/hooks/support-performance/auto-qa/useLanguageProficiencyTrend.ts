import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { languageProficiencyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { languageProficiencyQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useLanguageProficiencyTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        languageProficiencyQueryFactory(filters, timezone),
        languageProficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        languageProficiencyQueryV2Factory({ filters, timezone }),
        languageProficiencyQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchLanguageProficiencyTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        languageProficiencyQueryFactory(filters, timezone),
        languageProficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        languageProficiencyQueryV2Factory({ filters, timezone }),
        languageProficiencyQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
