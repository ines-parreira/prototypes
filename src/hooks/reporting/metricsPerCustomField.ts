import {
    MetricWithBreakdown,
    MetricWithDecile,
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { customFieldsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { StatsFilters } from 'models/stat/types'

export const useCustomFieldsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection,
): MetricWithDecile =>
    useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting,
        ),
    )
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
