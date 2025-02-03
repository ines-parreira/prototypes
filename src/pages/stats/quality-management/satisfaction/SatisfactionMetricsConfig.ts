import {
    fetchAverageScoreTrend,
    useAverageScoreTrend,
} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {
    fetchResponseRateTrend,
    useResponseRateTrend,
} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {
    fetchSatisfactionScoreTrend,
    useSatisfactionScoreTrend,
} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionScoreTrend'
import {
    fetchSurveysSentTrend,
    useSurveysSentTrend,
} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import {MetricTrendFetch, MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {SatisfactionMetric} from 'state/ui/stats/types'

export const SATISFACTION_SCORE_LABEL = 'Satisfaction score'
export const RESPONSE_RATE_LABEL = 'Response rate'
export const SURVEYS_SENT_LABEL = 'Surveys sent'
export const AVERAGE_SURVEY_SCORE = 'Average CSAT'

export const SatisfactionMetricConfig: Record<
    SatisfactionMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        fetchTrend: MetricTrendFetch
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: SatisfactionMetric
    }
> = {
    [SatisfactionMetric.SatisfactionScore]: {
        title: SATISFACTION_SCORE_LABEL,
        hint: {
            title: 'Total of "very satisfied" (5) or "satisfied" (4) divided by the total number of responses x 100 for Satisfaction Percentage',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        useTrend: useSatisfactionScoreTrend,
        fetchTrend: fetchSatisfactionScoreTrend,
        drillDownMetric: SatisfactionMetric.SatisfactionScore,
    },
    [SatisfactionMetric.ResponseRate]: {
        title: RESPONSE_RATE_LABEL,
        hint: {
            title: 'Total percentage of responses from surveys sent',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        useTrend: useResponseRateTrend,
        fetchTrend: fetchResponseRateTrend,
        drillDownMetric: SatisfactionMetric.ResponseRate,
    },
    [SatisfactionMetric.SurveysSent]: {
        title: SURVEYS_SENT_LABEL,
        hint: {
            title: 'Total number of surveys sent',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useSurveysSentTrend,
        fetchTrend: fetchSurveysSentTrend,
        drillDownMetric: SatisfactionMetric.SurveysSent,
    },
    [SatisfactionMetric.AverageSurveyScore]: {
        title: AVERAGE_SURVEY_SCORE,
        hint: {
            title: 'Average calculated score from 1-5 stars given by customers',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useAverageScoreTrend,
        fetchTrend: fetchAverageScoreTrend,
        drillDownMetric: SatisfactionMetric.AverageSurveyScore,
    },
}
