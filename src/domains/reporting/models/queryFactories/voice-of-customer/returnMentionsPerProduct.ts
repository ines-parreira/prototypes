import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    getCustomFieldValueSerializer,
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
} from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

const RETURN_MENTION_L1_INTENT = 'Return'

export const returnMentionsPerProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketProductsEnrichedMeasure.TicketCount],
    dimensions: [
        TicketProductsEnrichedDimension.ProductId,
        TicketProductsEnrichedDimension.StoreId,
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
            member: TicketMember.CustomField,
            operator: ReportingFilterOperator.StartsWith,
            values: [
                getCustomFieldValueSerializer(intentCustomFieldId)(
                    `${RETURN_MENTION_L1_INTENT}${TICKET_CUSTOM_FIELDS_API_SEPARATOR}`,
                ),
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
