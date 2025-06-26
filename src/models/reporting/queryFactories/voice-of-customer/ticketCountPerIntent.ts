import { OrderDirection, OrderField } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { injectCustomFieldId } from 'models/reporting/queryFactories/utils'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

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
})

export const ticketCountForIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    sorting?: OrderDirection,
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
