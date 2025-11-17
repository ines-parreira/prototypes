import type {
    MetricWithBreakdown,
    MetricWithDecile,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'domains/reporting/hooks/useMetricPerDimension'
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

    return useMetricPerDimension(
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

export const useCustomTicketFieldWithBreakdown = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: number,
    sorting?: OrderDirection,
): MetricWithBreakdown =>
    useMetricPerDimensionWithBreakdown(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting,
        ),
    )
