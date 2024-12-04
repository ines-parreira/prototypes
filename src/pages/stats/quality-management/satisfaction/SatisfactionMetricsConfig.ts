import {useAverageScoreTrend} from 'hooks/reporting/quality-management/satisfaction/useAverageScoreTrend'
import {useResponseRateTrend} from 'hooks/reporting/quality-management/satisfaction/useResponseRateTrend'
import {useSurveysSentTrend} from 'hooks/reporting/quality-management/satisfaction/useSurveysSentTrend'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {SatisfactionMetric} from 'state/ui/stats/types'

export const AVERAGE_SCORE_LABEL = 'Satisfaction score'
export const RESPONSE_RATE_LABEL = 'Response rate'
export const SURVEYS_SENT_LABEL = 'Surveys sent'

export const SatisfactionMetricConfig: Record<
    SatisfactionMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: SatisfactionMetric
    }
> = {
    [SatisfactionMetric.AverageScore]: {
        title: AVERAGE_SCORE_LABEL,
        hint: {
            title: 'Total of "very satisfied" (5) or "satisfied" (4) divided by the total number of responses x 100 for Satisfaction Percentage',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useAverageScoreTrend,
        drillDownMetric: SatisfactionMetric.AverageScore,
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
        drillDownMetric: SatisfactionMetric.SurveysSent,
    },
}
