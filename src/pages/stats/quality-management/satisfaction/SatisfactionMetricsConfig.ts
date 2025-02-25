import {
    fetchAverageCSATPerAssigneeTable,
    fetchAverageCSATPerChannelTable,
    fetchAverageCSATPerIntegrationTable,
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'hooks/reporting/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
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
import { SatisfactionMetric } from 'state/ui/stats/types'

export const SATISFACTION_SCORE_LABEL = 'Satisfaction score'
export const RESPONSE_RATE_LABEL = 'Response rate'
export const SURVEYS_SENT_LABEL = 'Surveys sent'
export const AVERAGE_SURVEY_SCORE = 'Average CSAT'
export const CSAT_SCORE = 'CSAT Score'

const AVERAGE_CSAT_PER_DIMENSION_DESCRIPTION =
    'Average from 1 to 5 stars in satisfaction per {dimension} over time.'

export const SatisfactionMetricConfig = {
    [SatisfactionMetric.SatisfactionScore]: {
        title: SATISFACTION_SCORE_LABEL,
        hint: {
            title: 'Percentage of CSAT surveys rated 4 or 5 out of all surveys rated, for surveys sent within the timeframe; surveys are sent following ticket resolution.',
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
            title: 'Percentage of surveys that were scored out of all the surveys sent during the timeframe; surveys are sent following ticket resolution.',
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
            title: 'Number of surveys sent during the timeframe; surveys are sent following ticket resolution.',
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
            title: 'Average CSAT score and rating distribution for surveys sent within the timeframe; surveys are sent following ticket resolution.',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useAverageScoreTrend,
        fetchTrend: fetchAverageScoreTrend,
        drillDownMetric: SatisfactionMetric.AverageSurveyScore,
    },
    [SatisfactionMetric.AverageCSATPerChannel]: {
        title: 'Average CSAT per Channel',
        hint: {
            title: AVERAGE_CSAT_PER_DIMENSION_DESCRIPTION.replace(
                '{dimension}',
                'channel',
            ),
        },
        interpretAs: 'more-is-better',
        drillDownMetric: SatisfactionMetric.AverageCSATPerChannel,
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerChannelTimeseries,
        fetchTable: fetchAverageCSATPerChannelTable,
    },
    [SatisfactionMetric.AverageCSATPerAssignee]: {
        title: 'Average CSAT per Assignee',
        hint: {
            title: AVERAGE_CSAT_PER_DIMENSION_DESCRIPTION.replace(
                '{dimension}',
                'assignee',
            ),
        },
        interpretAs: 'more-is-better',
        drillDownMetric: SatisfactionMetric.AverageCSATPerAssignee,
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerAssigneeTimeseries,
        fetchTable: fetchAverageCSATPerAssigneeTable,
    },
    [SatisfactionMetric.AverageCSATPerIntegration]: {
        title: 'Average CSAT per Integration',
        hint: {
            title: AVERAGE_CSAT_PER_DIMENSION_DESCRIPTION.replace(
                '{dimension}',
                'integration',
            ),
        },
        interpretAs: 'more-is-better',
        drillDownMetric: SatisfactionMetric.AverageCSATPerIntegration,
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerIntegrationTimeseries,
        fetchTable: fetchAverageCSATPerIntegrationTable,
    },
} as const
