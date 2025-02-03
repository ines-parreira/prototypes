import useMetricTrend, {fetchMetricTrend} from 'hooks/reporting/useMetricTrend'
import {surveysSentQueryFactory} from 'models/reporting/queryFactories/satisfaction/surveysSentQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useSurveysSentTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        surveysSentQueryFactory(filters, timezone),
        surveysSentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const fetchSurveysSentTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    fetchMetricTrend(
        surveysSentQueryFactory(filters, timezone),
        surveysSentQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
