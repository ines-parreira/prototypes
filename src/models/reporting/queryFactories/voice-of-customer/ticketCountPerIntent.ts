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

export const ticketCountPerIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
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
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(intentCustomFieldId)],
        },
    ],
    order: sorting ? [[sortingField, sorting]] : undefined,
})

export const productsTicketCountPerIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    sorting?: OrderDirection,
) => {
    const { filters, ...baseQuery } = ticketCountPerIntentQueryFactory(
        statsFilters,
        timezone,
        intentCustomFieldId,
        sorting,
    )

    filters.push({
        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
        operator: ReportingFilterOperator.Equals,
        values: [intentsCustomFieldValueString],
    })

    return {
        ...baseQuery,
        dimensions: [
            TicketProductsEnrichedDimension.ProductId,
            TicketProductsEnrichedDimension.StoreId,
        ],
        filters,
    }
}

export const ticketCountPerIntentDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...ticketCountPerIntentQueryFactory(
        statsFilters,
        timezone,
        intentCustomFieldId,
        sorting,
    ),
    limit: DRILLDOWN_QUERY_LIMIT,
})

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
        intentCustomFieldId,
        sorting,
        sortingField,
    )

    baseQuery.filters.push({
        member: TicketProductsEnrichedDimension.ProductId,
        operator: ReportingFilterOperator.Equals,
        values: [productId],
    })

    return baseQuery
}

export const ticketCountPerIntentForProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const { filters, ...baseQuery } =
        ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            productId,
        )

    filters.push({
        member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
        operator: ReportingFilterOperator.Equals,
        values: [intentsCustomFieldValueString],
    })

    return {
        ...baseQuery,
        filters,
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: sorting
            ? [[TicketDimension.CreatedDatetime, sorting]]
            : undefined,
    }
}

export const ticketCountPerIntentForProductsDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    intentsCustomFieldValueString: string,
): ReportingQuery<TicketCubeWithJoins> => {
    const { filters, ...baseQuery } = ticketCountPerIntentDrillDownQueryFactory(
        statsFilters,
        timezone,
        intentCustomFieldId,
    )

    return {
        ...baseQuery,
        filters: [
            ...filters,
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                operator: ReportingFilterOperator.Equals,
                values: [intentsCustomFieldValueString],
            },
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
