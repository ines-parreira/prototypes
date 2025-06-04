import {
    MetricWithBreakdown,
    MetricWithDecile,
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    customFieldsTicketCountForProductOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountOnCreatedDatetimeQueryFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { StatsFilters, TicketTimeReference } from 'models/stat/types'

export const useCustomFieldsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
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
    customFieldId: string,
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
    customFieldId: string,
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
