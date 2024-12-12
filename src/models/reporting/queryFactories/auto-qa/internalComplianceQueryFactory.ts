import {TicketStatus} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
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

export const internalComplianceQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    measures: [TicketQAScoreMeasure.AverageScore],
    dimensions: [],
    segments: [],
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketDimension.Status,
            operator: ReportingFilterOperator.Equals,
            values: [TicketStatus.Closed],
        },
        {
            member: TicketQAScoreDimension.DimensionName,
            operator: ReportingFilterOperator.Equals,
            values: [TicketQAScoreDimensionName.InternalCompliance],
        },
    ],
    timezone,
    ...(sorting
        ? {
              order: [[TicketQAScoreMeasure.AverageScore, sorting]],
          }
        : {}),
})

export const internalCompliancePerAgentQueryFactory = perDimensionQueryFactory(
    internalComplianceQueryFactory,
    TicketDimension.AssigneeUserId
)

export const internalComplianceDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...internalComplianceQueryFactory(filters, timezone, sorting),
    measures: [
        TicketQAScoreMeasure.AverageScore,
        TicketQAScoreMeasure.QAScoreData,
    ],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
