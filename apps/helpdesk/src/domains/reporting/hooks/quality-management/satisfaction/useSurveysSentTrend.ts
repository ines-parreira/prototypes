import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { surveysSentQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveysSentQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useSurveysSentTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        surveysSentQueryFactory(filters, timezone),
        surveysSentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export const fetchSurveysSentTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        surveysSentQueryFactory(filters, timezone),
        surveysSentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
