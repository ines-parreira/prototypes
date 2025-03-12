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

export const languageProficiencyQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
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
                      TicketQAScoreMeasure.AverageLanguageProficiencyScore,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const languageProficiencyPerAgentQueryFactory = perDimensionQueryFactory(
    languageProficiencyQueryFactory,
    TicketDimension.AssigneeUserId,
)

export const languageProficiencyDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...languageProficiencyQueryFactory(filters, timezone, sorting),
    measures: [TicketQAScoreMeasure.AverageLanguageProficiencyScore],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
