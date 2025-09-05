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

export const communicationSkillsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    metricName: METRIC_NAMES.AUTO_QA_COMMUNICATION_SKILLS,
    measures: [TicketQAScoreMeasure.AverageCommunicationSkillsScore],
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
    ...(sorting
        ? {
              order: [
                  [
                      TicketQAScoreMeasure.AverageCommunicationSkillsScore,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const communicationSkillsPerAgentQueryFactory = perDimensionQueryFactory(
    communicationSkillsQueryFactory,
    TicketDimension.AssigneeUserId,
    METRIC_NAMES.AUTO_QA_COMMUNICATION_SKILLS_PER_AGENT,
)

export const communicationSkillsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...communicationSkillsQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.AUTO_QA_COMMUNICATION_SKILLS_DRILL_DOWN,
    measures: [TicketQAScoreMeasure.AverageCommunicationSkillsScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
