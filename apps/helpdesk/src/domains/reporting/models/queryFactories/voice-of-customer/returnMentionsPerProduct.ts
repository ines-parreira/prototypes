import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    getCustomFieldValueSerializer,
    TICKET_CUSTOM_FIELDS_API_SEPARATOR,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

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
    metricName: METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT,
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
        metricName:
            METRIC_NAMES.VOICE_OF_CUSTOMER_RETURN_MENTIONS_PER_PRODUCT_DRILL_DOWN,
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
