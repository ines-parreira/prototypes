import { Sentiment } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { OrderDirection } from 'models/api/types'
import { TicketProductsEnrichedDimension } from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { injectDrillDownCustomFieldId } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const sentimentsTicketCountPerProductQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
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
            values: [customFieldId],
        },
        {
            member: TicketProductsEnrichedDimension.DeletedDatetime,
            operator: ReportingFilterOperator.Equals,
            values: [null],
        },
    ]

    if (productId) {
        filters.push({
            member: TicketProductsEnrichedDimension.ProductId,
            operator: ReportingFilterOperator.Equals,
            values: [productId],
        })
    }

    return {
        measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
        dimensions: [
            TicketProductsEnrichedDimension.ProductId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        ],
        timezone,
        filters,
        order: sorting
            ? [
                  [
                      TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                      sorting,
                  ],
              ]
            : undefined,
    }
}

export const sentimentsTicketCountPerProductDrillDownQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sentiment: Sentiment,
    productId: string,
    sorting = OrderDirection.Desc,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = sentimentsTicketCountPerProductQueryFactory(
        injectDrillDownCustomFieldId(statsFilters, Number(customFieldId), [
            sentiment,
        ]),
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
