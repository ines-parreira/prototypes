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

export const brandVoiceQueryFactory = (
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
            values: [TicketQAScoreDimensionName.BrandVoice],
        },
    ],
    timezone,
    ...(sorting
        ? {
              order: [[TicketQAScoreMeasure.AverageScore, sorting]],
          }
        : {}),
})

export const brandVoicePerAgentQueryFactory = perDimensionQueryFactory(
    brandVoiceQueryFactory,
    TicketDimension.AssigneeUserId
)

export const brandVoiceDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketQAScoreCubeWithJoins> => ({
    ...brandVoiceQueryFactory(filters, timezone, sorting),
    measures: [
        TicketQAScoreMeasure.AverageScore,
        TicketQAScoreMeasure.QAScoreData,
    ],
    dimensions: [TicketDimension.TicketId],
    limit: DRILLDOWN_QUERY_LIMIT,
})
