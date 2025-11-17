import {
    fetchAverageCSATPerAssigneeTable,
    fetchAverageCSATPerChannelTable,
    fetchAverageCSATPerIntegrationTable,
    useAverageCSATPerAssigneeTimeseries,
    useAverageCSATPerChannelTimeseries,
    useAverageCSATPerIntegrationTimeseries,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScorePerDimensionTimeSeries'
import {
    fetchAverageScoreTrend,
    useAverageScoreTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useAverageScoreTrend'
import {
    fetchResponseRateTrend,
    useResponseRateTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useResponseRateTrend'
import {
    fetchSatisfactionScoreTrend,
    useSatisfactionScoreTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionScoreTrend'
import {
    fetchSurveysSentTrend,
    useSurveysSentTrend,
} from 'domains/reporting/hooks/quality-management/satisfaction/useSurveysSentTrend'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import { averageCSATScorePerDimensionDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageCSATScorePerDimensionQueryFactory'
import {
    averageScoreDrillDownQueryFactory,
    averageScoreDrillDownWithScoreQueryBuilder,
    SatisfactionSurveyScore,
} from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import { responseRateDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/responseRateQueryFactory'
import { satisfactionScoreDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/satisfactionScoreQueryFactory'
import { surveysSentDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/surveysSentQueryFactory'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    SatisfactionAverageSurveyScoreMetric,
    SatisfactionMetric,
} from 'domains/reporting/state/ui/stats/types'

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
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: satisfactionScoreDrillDownQueryFactory,
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
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: responseRateDrillDownQueryFactory,
    },
    [SatisfactionMetric.SurveysSent]: {
        title: SURVEYS_SENT_LABEL,
        hint: {
            title: 'Number of surveys sent during the timeframe; surveys are sent following ticket resolution.',
            link: 'https://link.gorgias.com/858019',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useSurveysSentTrend,
        fetchTrend: fetchSurveysSentTrend,
        drillDownMetric: SatisfactionMetric.SurveysSent,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: surveysSentDrillDownQueryFactory,
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
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownQueryFactory,
        drillDownTitle: CSAT_SCORE,
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
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerChannelTimeseries,
        fetchTable: fetchAverageCSATPerChannelTable,
        drillDownMetric: SatisfactionMetric.AverageCSATPerChannel,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageCSATScorePerDimensionDrillDownQueryFactory(
            TicketDimension.Channel,
        ),
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
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerAssigneeTimeseries,
        fetchTable: fetchAverageCSATPerAssigneeTable,
        drillDownMetric: SatisfactionMetric.AverageCSATPerAssignee,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageCSATScorePerDimensionDrillDownQueryFactory(
            TicketDimension.AssigneeUserId,
        ),
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
        metricFormat: 'decimal',
        useTrend: useAverageCSATPerIntegrationTimeseries,
        fetchTable: fetchAverageCSATPerIntegrationTable,
        drillDownMetric: SatisfactionMetric.AverageCSATPerIntegration,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageCSATScorePerDimensionDrillDownQueryFactory(
            TicketMessagesDimension.Integration,
        ),
    },
} as const

export const SatisfactionAverageSurveyScoreMetricConfig: Record<
    SatisfactionAverageSurveyScoreMetric,
    {
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: DrillDownQueryFactory
        title: string
        metricFormat: MetricValueFormat
    }
> = {
    [SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreOne]: {
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownWithScoreQueryBuilder(
            SatisfactionSurveyScore.One,
        ),
        title: CSAT_SCORE,
        metricFormat: 'decimal',
    },
    [SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreTwo]: {
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownWithScoreQueryBuilder(
            SatisfactionSurveyScore.Two,
        ),
        title: CSAT_SCORE,
        metricFormat: 'decimal',
    },
    [SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreThree]: {
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownWithScoreQueryBuilder(
            SatisfactionSurveyScore.Three,
        ),
        title: CSAT_SCORE,
        metricFormat: 'decimal',
    },
    [SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFour]: {
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownWithScoreQueryBuilder(
            SatisfactionSurveyScore.Four,
        ),
        title: CSAT_SCORE,
        metricFormat: 'decimal',
    },
    [SatisfactionAverageSurveyScoreMetric.AverageSurveyScoreFive]: {
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: averageScoreDrillDownWithScoreQueryBuilder(
            SatisfactionSurveyScore.Four,
        ),
        title: CSAT_SCORE,
        metricFormat: 'decimal',
    },
}
