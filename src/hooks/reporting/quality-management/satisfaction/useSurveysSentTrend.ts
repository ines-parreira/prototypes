import useMetricTrend from 'hooks/reporting/useMetricTrend'
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
