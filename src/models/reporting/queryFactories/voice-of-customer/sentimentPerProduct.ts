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
import { injectCustomFieldId } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import { Sentiment, StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const PRODUCT_ID_DIMENSION = TicketProductsEnrichedDimension.ProductId
export const INTENT_DIMENSION =
    TicketCustomFieldsDimension.TicketCustomFieldsValueString
export const TICKET_COUNT_MEASURE = TicketProductsEnrichedMeasure.TicketCount

export const sentimentsTicketCountPerProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    productId?: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const filters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters,
        ),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(statsFilters.period.start_datetime),
                formatReportingQueryDate(statsFilters.period.end_datetime),
            ],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [String(customFieldId)],
        },
        {
            member: TicketProductsEnrichedDimension.DeletedDatetime,
            operator: ReportingFilterOperator.Equals,
            values: [null],
        },
    ]

    if (productId) {
        filters.push({
            member: PRODUCT_ID_DIMENSION,
            operator: ReportingFilterOperator.Equals,
            values: [productId],
        })
    }

    return {
        measures: [TICKET_COUNT_MEASURE],
        dimensions: [PRODUCT_ID_DIMENSION, INTENT_DIMENSION],
        timezone,
        filters,
        order: sorting ? [[TICKET_COUNT_MEASURE, sorting]] : undefined,
    }
}

export const sentimentsTicketCountPerProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sentiment: Sentiment,
    productId: string,
    sorting = OrderDirection.Desc,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = sentimentsTicketCountPerProductQueryFactory(
        injectCustomFieldId(statsFilters, Number(customFieldId), [sentiment]),
        timezone,
        customFieldId,
        productId,
        sorting,
    )

    return {
        ...baseQuery,
        dimensions: [TicketDimension.TicketId],
        limit: DRILLDOWN_QUERY_LIMIT,
        order: [[TicketDimension.CreatedDatetime, sorting]],
    }
}
