import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketCustomFieldsDimension} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilter, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const customerSatisfactionPerCustomFieldQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    additionalFilter?: ReportingFilter
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketSatisfactionSurveyMeasure.AvgSurveyScore],
    dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    timezone,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters
        ),
        ...(additionalFilter ? [additionalFilter] : []),
    ],
    ...(sorting
        ? {
              order: [
                  [TicketSatisfactionSurveyMeasure.AvgSurveyScore, sorting],
              ],
          }
        : {}),
})
