import { TicketStatus } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreMeasure,
} from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const reviewedClosedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [TicketQAScoreMeasure.TicketCount],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketDimension.Status,
            operator: ReportingFilterOperator.Equals,
            values: [TicketStatus.Closed],
        },
    ],
    timezone,
    metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS,
    ...(sorting
        ? {
              order: [[TicketQAScoreMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const reviewedClosedTicketsPerAgentQueryFactory =
    perDimensionQueryFactory(
        reviewedClosedTicketsQueryFactory,
        TicketDimension.AssigneeUserId,
        METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS_PER_AGENT,
    )

export const reviewedClosedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...reviewedClosedTicketsQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AUTO_QA_REVIEWED_CLOSED_TICKETS_DRILL_DOWN,
    measures: [
        TicketQAScoreMeasure.QAScoreData,
        TicketQAScoreMeasure.AverageAccuracyScore,
        TicketQAScoreMeasure.AverageBrandVoiceScore,
        TicketQAScoreMeasure.AverageCommunicationSkillsScore,
        TicketQAScoreMeasure.AverageEfficiencyScore,
        TicketQAScoreMeasure.AverageInternalComplianceScore,
        TicketQAScoreMeasure.AverageLanguageProficiencyScore,
        TicketQAScoreMeasure.AverageResolutionCompletenessScore,
    ],
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
