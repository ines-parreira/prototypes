import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'utils/reporting'

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

export const ticketsWithProductsDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...ticketsWithProductsQueryFactory(statsFilters, timezone, sorting),
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    limit: DRILLDOWN_QUERY_LIMIT,
    order: [[TicketDimension.CreatedDatetime, OrderDirection.Desc]],
})

export const ticketCountForProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    productId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = ticketsWithProductsDrillDownQueryFactory(
        statsFilters,
        timezone,
        sorting,
    )

    baseQuery.filters.push({
        member: TicketProductsEnrichedDimension.ProductId,
        operator: ReportingFilterOperator.Equals,
        values: [productId],
    })

    return baseQuery
}
