import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import { TicketCustomFieldsMember } from 'models/reporting/cubes/TicketCustomFieldsCube'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

const RETURN_MENTION_L1_INTENT = 'Return'

export const returnMentionsPerProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketProductsEnrichedMeasure.TicketCount],
    dimensions: [TicketProductsEnrichedDimension.ProductId],
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
            values: [String(intentCustomFieldId)],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: [
                `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
            ],
        },
    ],
    ...(sorting
        ? {
              order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const returnMentionsPerProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = returnMentionsPerProductQueryFactory(
        statsFilters,
        timezone,
        intentCustomFieldId,
        sorting,
    )

    return {
        ...baseQuery,
        dimensions: [TicketDimension.TicketId],
        filters: [
            ...baseQuery.filters,
            {
                member: TicketProductsEnrichedDimension.ProductId,
                operator: ReportingFilterOperator.Equals,
                values: [productId],
            },
        ],
    }
}
