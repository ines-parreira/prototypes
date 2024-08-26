import {OrderDirection} from 'models/api/types'
import {
    TicketQAScoreCubeWithJoins,
    TicketQAScoreDimension,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const resolvedTicketsQueryFactory = (
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
            values: ['closed'],
        },
        {
            member: TicketQAScoreDimension.DimensionName,
            operator: ReportingFilterOperator.Equals,
            values: ['resolution_completeness'],
        },
        {
            member: TicketQAScoreDimension.Prediction,
            operator: ReportingFilterOperator.Equals,
            values: ['1'],
        },
    ],
    timezone,
    ...(sorting
        ? {
              order: [[TicketQAScoreMeasure.AverageScore, sorting]],
          }
        : {}),
})

export const resolvedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...resolvedTicketsQueryFactory(filters, timezone, sorting),
    measures: [TicketQAScoreMeasure.AverageScore],
    dimensions: [TicketDimension.TicketId],
})
