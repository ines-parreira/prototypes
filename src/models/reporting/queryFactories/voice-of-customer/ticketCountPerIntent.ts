import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

export const ticketCountPerIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketProductsEnrichedMeasure.TicketCount],
    dimensions: [
        TicketProductsEnrichedDimension.ProductId,
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    ],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketMessagesEnrichedFirstResponseTimesMembers,
            statsFilters,
        ),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [intentsCustomFieldId],
        },
        {
            member: TicketProductsEnrichedDimension.DeletedDatetime,
            operator: ReportingFilterOperator.Equals,
            values: [null],
        },
    ],
    ...(sorting
        ? {
              order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const ticketCountPerIntentDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...ticketCountPerIntentQueryFactory(
        statsFilters,
        timezone,
        intentsCustomFieldId,
        sorting,
    ),
    limit: DRILLDOWN_QUERY_LIMIT,
})
