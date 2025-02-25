import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { surveyScoresQueryFactory } from 'models/reporting/queryFactories/satisfaction/surveyScoresQueryFactory'
import { StatsFilters } from 'models/stat/types'

export const useSurveyScores = (filters: StatsFilters, timezone: string) =>
    useMetricPerDimension(surveyScoresQueryFactory(filters, timezone))

export const fetchSurveyScores = (filters: StatsFilters, timezone: string) =>
    fetchMetricPerDimension(surveyScoresQueryFactory(filters, timezone))
