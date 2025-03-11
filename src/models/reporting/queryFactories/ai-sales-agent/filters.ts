import { AiSalesAgentConversationsFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { ConvertTrackingEventsDimension } from 'models/reporting/cubes/convert/ConvertTrackingEventsCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate, StatsFiltersMembers } from 'utils/reporting'

export const aiSalesAgentOrdersDefaultFiltersMembers: StatsFiltersMembers = {
    periodStart: AiSalesAgentOrdersFilterMember.PeriodStart,
    periodEnd: AiSalesAgentOrdersFilterMember.PeriodEnd,
    storeIntegrations: AiSalesAgentOrdersFilterMember.IntegrationId,
}

export const aiSalesAgentConversationsDefaultFiltersMembers: StatsFiltersMembers =
    {
        periodStart: AiSalesAgentConversationsFilterMember.PeriodStart,
        periodEnd: AiSalesAgentConversationsFilterMember.PeriodEnd,
        storeIntegrations:
            AiSalesAgentConversationsFilterMember.StoreIntegrationId,
    }

export const clicksDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: ConvertTrackingEventsDimension.CreatedDatetime,
        operator: ReportingFilterOperator.InDateRange,
        values: [
            formatReportingQueryDate(filters.period.start_datetime),
            formatReportingQueryDate(filters.period.end_datetime),
        ],
    },
]
