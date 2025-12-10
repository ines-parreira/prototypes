import type { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    ticketFieldsCountPerFieldValueQueryV2Factory,
    withCustomFieldIdAndProductFilter,
} from 'domains/reporting/models/scopes/ticketFields'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import type { OrderDirection } from 'models/api/types'

export const useCustomFieldsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sorting?: OrderDirection,
    timeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
): MetricWithDecile => {
    const queryFactory =
        timeReference === TicketTimeReference.TaggedAt
            ? customFieldsTicketCountQueryFactory
            : customFieldsTicketCountOnCreatedDatetimeQueryFactory

    return useMetricPerDimensionV2(
        queryFactory(statsFilters, timezone, customFieldId, sorting),
        ticketFieldsCountPerFieldValueQueryV2Factory({
            filters: withCustomFieldIdAndProductFilter(
                statsFilters,
                timeReference,
                customFieldId,
            ),
            timezone,
            sortDirection: sorting,
        }),
    )
}

export const useCustomFieldsForProductTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    productId: string,
    sorting?: OrderDirection,
): MetricWithDecile => {
    return useMetricPerDimensionV2(
        customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            productId,
            sorting,
        ),
        ticketFieldsCountPerFieldValueQueryV2Factory({
            filters: withCustomFieldIdAndProductFilter(
                statsFilters,
                TicketTimeReference.CreatedAt,
                customFieldId,
                productId,
            ),
            timezone,
            sortDirection: sorting,
        }),
    )
}
