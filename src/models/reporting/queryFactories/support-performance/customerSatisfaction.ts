import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const customerSatisfactionQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
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
})
export const customerSatisfactionMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...customerSatisfactionQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
})
