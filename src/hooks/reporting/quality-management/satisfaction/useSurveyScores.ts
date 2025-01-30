import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {surveyScoresQueryFactory} from 'models/reporting/queryFactories/satisfaction/surveyScoresQueryFactory'
import {StatsFilters} from 'models/stat/types'

export const useSurveyScores = (filters: StatsFilters, timezone: string) =>
    useMetricPerDimension(surveyScoresQueryFactory(filters, timezone))
