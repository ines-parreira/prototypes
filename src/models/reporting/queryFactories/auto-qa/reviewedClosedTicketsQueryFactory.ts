import {TicketStatus} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const reviewedClosedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [
        TicketQAScoreMeasure.TicketCount,
        TicketQAScoreMeasure.AverageScore,
    ],
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
              order: [[TicketQAScoreMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const reviewedClosedTicketsPerAgentQueryFactory =
    perDimensionQueryFactory(
        reviewedClosedTicketsQueryFactory,
        TicketDimension.AssigneeUserId
    )

export const reviewedClosedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...reviewedClosedTicketsQueryFactory(filters, timezone, sorting),
    measures: [TicketQAScoreMeasure.QAScoreData],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
