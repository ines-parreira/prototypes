import { AiSalesAgentConversationsFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { AiSalesAgentOrderCustomersFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
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
    channels: AiSalesAgentOrdersFilterMember.Channel,
}

export const aiSalesAgentOrderCustomersDefaultFiltersMembers: StatsFiltersMembers =
    {
        periodStart: AiSalesAgentOrderCustomersFilterMember.PeriodStart,
        periodEnd: AiSalesAgentOrderCustomersFilterMember.PeriodEnd,
        storeIntegrations: AiSalesAgentOrderCustomersFilterMember.IntegrationId,
        channels: AiSalesAgentOrderCustomersFilterMember.Channel,
    }

export const aiSalesAgentConversationsDefaultFiltersMembers: StatsFiltersMembers =
    {
        periodStart: AiSalesAgentConversationsFilterMember.PeriodStart,
        periodEnd: AiSalesAgentConversationsFilterMember.PeriodEnd,
        storeIntegrations:
            AiSalesAgentConversationsFilterMember.StoreIntegrationId,
        channels: AiSalesAgentConversationsFilterMember.Channel,
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
