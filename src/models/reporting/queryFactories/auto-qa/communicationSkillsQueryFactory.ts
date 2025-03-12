import { TicketStatus } from 'business/types/ticket'
import { OrderDirection } from 'models/api/types'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const communicationSkillsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
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
)

export const communicationSkillsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...communicationSkillsQueryFactory(filters, timezone, sorting),
    measures: [TicketQAScoreMeasure.AverageCommunicationSkillsScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
