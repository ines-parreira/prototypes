import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const ticketsWithProductsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketProductsEnrichedMeasure.TicketCount],
    dimensions: [],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketMessagesEnrichedFirstResponseTimesMembers,
            statsFilters,
        ),
    ],
    ...(sorting
        ? {
              order: [[TicketProductsEnrichedMeasure.TicketCount, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.VOICE_OF_CUSTOMER_TICKETS_WITH_PRODUCTS,
})

export const ticketCountPerProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...ticketsWithProductsQueryFactory(statsFilters, timezone, sorting),
    dimensions: [
        TicketProductsEnrichedDimension.ProductId,
        TicketProductsEnrichedDimension.StoreId,
    ],
})

export const ticketCountForProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = ticketsWithProductsQueryFactory(
        statsFilters,
        timezone,
        sorting,
    )

    baseQuery.filters.push({
        member: TicketProductsEnrichedDimension.ProductId,
        operator: ReportingFilterOperator.Equals,
        values: [productId],
    })

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.VOICE_OF_CUSTOMER_TICKET_COUNT_FOR_PRODUCT_DRILL_DOWN,
        dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
    }
}
