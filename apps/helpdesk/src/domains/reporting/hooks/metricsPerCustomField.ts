import type {
    MetricWithDecile,
    StringWhichShouldBeNumber,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
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

    return useMetricPerDimension<StringWhichShouldBeNumber>(
        queryFactory(statsFilters, timezone, customFieldId, sorting),
    )
}

export const useCustomFieldsForProductTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    productId: string,
    sorting?: OrderDirection,
): MetricWithDecile => {
    return useMetricPerDimension(
        customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            productId,
            sorting,
        ),
    )
}
