import { TicketStatus } from 'business/types/ticket'
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

export const internalComplianceQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
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
                      TicketQAScoreMeasure.AverageInternalComplianceScore,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const internalCompliancePerAgentQueryFactory = perDimensionQueryFactory(
    internalComplianceQueryFactory,
    TicketDimension.AssigneeUserId,
)

export const internalComplianceDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...internalComplianceQueryFactory(filters, timezone, sorting),
    measures: [TicketQAScoreMeasure.AverageInternalComplianceScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
