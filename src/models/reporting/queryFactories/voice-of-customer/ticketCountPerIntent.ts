import { OrderDirection } from 'models/api/types'
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

export const TICKET_COUNT_MEASURE = TicketProductsEnrichedMeasure.TicketCount

const NotDeletedTicketProductsFilter = [
    {
        member: TicketProductsEnrichedDimension.DeletedDatetime,
        operator: ReportingFilterOperator.Equals,
        values: [null],
    },
]

export const ticketCountPerIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
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
            values: [intentsCustomFieldId],
        },
    ],
    order: sorting
        ? [[TicketProductsEnrichedMeasure.TicketCount, sorting]]
        : undefined,
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

export const ticketCountPerIntentForProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = ticketCountPerIntentQueryFactory(
        statsFilters,
        timezone,
        intentsCustomFieldId,
        sorting,
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
    intentsCustomFieldId: string,
    intentsCustomFieldValueString: string,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const { filters, ...baseQuery } =
        ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
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
