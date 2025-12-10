import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { accuracyQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { accuracyQueryV2Factory } from 'domains/reporting/models/scopes/autoQA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAccuracyTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        accuracyQueryFactory(filters, timezone),
        accuracyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        accuracyQueryV2Factory({ filters, timezone }),
        accuracyQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAccuracyTrend = (filters: StatsFilters, timezone: string) =>
    fetchMetricTrend(
        accuracyQueryFactory(filters, timezone),
        accuracyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        accuracyQueryV2Factory({ filters, timezone }),
        accuracyQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
