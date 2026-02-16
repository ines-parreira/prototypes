import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { customFieldsTicketCountTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { injectCustomFieldId } from 'domains/reporting/models/queryFactories/utils'
import { ticketsWithProductsQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import type {
    Sentiment,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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

// new-stats-api: covered by ticketFieldsCountTimeSeriesQueryV2Factory
export const intentsWithProductsTicketCountTimeseriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sentimentCustomFieldId: number,
    sentimentValueStrings: Sentiment[],
    sorting?: OrderDirection,
) => {
    const baseQuery = customFieldsTicketCountTimeSeriesQueryFactory(
        injectCustomFieldId(
            filters,
            sentimentCustomFieldId,
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
                operator: ReportingFilterOperator.Set,
                values: [],
            },
        ],
    }
}
