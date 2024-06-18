import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyDimension,
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const customerSatisfactionQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [],
    timezone,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters
        ),
    ],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
})

export const customerSatisfactionMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        customerSatisfactionQueryFactory,
        TicketDimension.AssigneeUserId
    )

export const customerSatisfactionMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        customerSatisfactionQueryFactory,
        CHANNEL_DIMENSION
    )

export const customerSatisfactionMetricDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = customerSatisfactionMetricPerAgentQueryFactory(
        filters,
        timezone,
        sorting
    )
    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketSatisfactionSurveyDimension.SurveyScore,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [TicketSatisfactionSurveyDimension.SurveyScore, sorting],
                  ],
              }
            : {}),
    }
}
