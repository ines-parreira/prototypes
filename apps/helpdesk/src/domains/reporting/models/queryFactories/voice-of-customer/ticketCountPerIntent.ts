import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { injectCustomFieldId } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection, OrderField } from 'models/api/types'

export const PRODUCT_ID_DIMENSION = TicketProductsEnrichedDimension.ProductId
export const INTENT_DIMENSION =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const TICKET_COUNT_MEASURE = TicketProductsEnrichedMeasure.TicketCount

const NotDeletedTicketProductsFilter = [
    {
        member: TicketProductsEnrichedDimension.DeletedDatetime,
        operator: ReportingFilterOperator.Equals,
        values: [null],
    },
]

export const TicketPerIntentSortingField = Object.freeze({
    TicketCount: TicketProductsEnrichedMeasure.TicketCount,
    CustomFieldValueString:
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
})

export type TicketsPerIntentOrderField = OrderField<
    typeof TicketPerIntentSortingField
>

const ticketCountPerIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    sortingField: TicketsPerIntentOrderField = TicketPerIntentSortingField.TicketCount,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TICKET_COUNT_MEASURE],
    dimensions: [
        TicketProductsEnrichedDimension.ProductId,
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    ],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...NotDeletedTicketProductsFilter,
        ...statsFiltersToReportingFilters(
            TicketMessagesEnrichedFirstResponseTimesMembers,
            statsFilters,
        ),
    ],
    order: sorting ? [[sortingField, sorting]] : undefined,
    metricName: METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_PER_INTENT,
})

export const ticketCountForIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    sorting?: OrderDirection,
    limit?: number,
) => {
    const baseQuery = ticketCountPerIntentQueryFactory(
        injectCustomFieldId(statsFilters, intentCustomFieldId, [
            intentsCustomFieldValueString,
        ]),
        timezone,
        sorting,
    )

    return {
        ...baseQuery,
        metricName: METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_INTENT,
        limit,
        dimensions: [
            TicketProductsEnrichedDimension.ProductId,
            TicketProductsEnrichedDimension.StoreId,
        ],
    }
}

export const ticketCountPerIntentForProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId: string,
    sorting?: OrderDirection,
    sortingField?: TicketsPerIntentOrderField,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = ticketCountPerIntentQueryFactory(
        statsFilters,
        timezone,
        sorting,
        sortingField,
    )

    baseQuery.dimensions = [
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    ]

    baseQuery.filters.push({
        member: TicketProductsEnrichedDimension.ProductId,
        operator: ReportingFilterOperator.Equals,
        values: [productId],
    })

    baseQuery.filters.push({
        member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
        operator: ReportingFilterOperator.Equals,
        values: [String(intentCustomFieldId)],
    })

    baseQuery.metricName =
        METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_PER_INTENT_FOR_PRODUCT

    return baseQuery
}

export const ticketCountForIntentAndProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    productId: string,
    sorting?: OrderDirection,
    sortingField?: TicketsPerIntentOrderField,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = ticketCountPerIntentQueryFactory(
        injectCustomFieldId(statsFilters, intentCustomFieldId, [
            intentsCustomFieldValueString,
        ]),
        timezone,
        sorting,
        sortingField,
    )

    baseQuery.dimensions = [
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    ]

    baseQuery.filters.push({
        member: TicketProductsEnrichedDimension.ProductId,
        operator: ReportingFilterOperator.Equals,
        values: [productId],
    })

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_PER_INTENT_AND_PRODUCT_DRILL_DOWN,
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: sorting
            ? [[TicketDimension.CreatedDatetime, sorting]]
            : undefined,
    }
}

export const ticketCountForIntentDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
): ReportingQuery<TicketCubeWithJoins> => {
    const { filters, ...baseQuery } = ticketCountPerIntentQueryFactory(
        injectCustomFieldId(statsFilters, intentCustomFieldId, [
            intentsCustomFieldValueString,
        ]),
        timezone,
    )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_INTENT_DRILL_DOWN,
        filters: [
            ...filters,
            {
                member: TicketProductsEnrichedDimension.ProductId,
                operator: ReportingFilterOperator.NotEquals,
                values: ['null', 'undefined'],
            },
        ],
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
    }
}
