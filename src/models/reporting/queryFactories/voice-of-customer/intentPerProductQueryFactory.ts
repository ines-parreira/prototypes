import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { TicketCubeWithJoins } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountTimeSeriesQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { injectCustomFieldId } from 'models/reporting/queryFactories/utils'
import { ticketsWithProductsQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
} from 'models/reporting/types'
import { Sentiment, StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

export const ticketCountPerProductAndIntentQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...ticketsWithProductsQueryFactory(statsFilters, timezone, sorting),
    dimensions: [
        TicketProductsEnrichedDimension.ProductId,
        TicketCustomFieldsDimension.TicketCustomFieldsValueString,
    ],
    filters: [
        ...ticketsWithProductsQueryFactory(statsFilters, timezone, sorting)
            .filters,
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [customFieldId],
        },
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(statsFilters.period.start_datetime),
                formatReportingQueryDate(statsFilters.period.end_datetime),
            ],
        },
    ],
    order: [[TicketProductsEnrichedMeasure.TicketCount, OrderDirection.Desc]],
})

export const intentsWithProductsTicketCountTimeseriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sentimentCustomFieldId: string,
    sentimentValueStrings: Sentiment[],
    sorting?: OrderDirection,
) => {
    const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
        injectCustomFieldId(
            filters,
            Number(sentimentCustomFieldId),
            sentimentValueStrings,
        ),
        timezone,
        granularity,
        sentimentCustomFieldId,
        sorting,
    )

    return {
        ...baseQuery,
        filters: [
            ...baseQuery.filters,
            {
                member: TicketProductsEnrichedDimension.ProductId,
                operator: ReportingFilterOperator.NotEquals,
                values: ['null'],
            },
        ],
    }
}
