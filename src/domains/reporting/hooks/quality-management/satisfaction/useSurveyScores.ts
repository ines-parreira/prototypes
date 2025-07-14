import {
    fetchMetricPerDimension,
    useMetricPerDimension,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { surveyScoresQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveyScoresQueryFactory'
import { StatsFilters } from 'domains/reporting/models/stat/types'

export const useSurveyScores = (filters: StatsFilters, timezone: string) =>
    useMetricPerDimension(surveyScoresQueryFactory(filters, timezone))

export const fetchSurveyScores = (filters: StatsFilters, timezone: string) =>
    fetchMetricPerDimension(surveyScoresQueryFactory(filters, timezone))
