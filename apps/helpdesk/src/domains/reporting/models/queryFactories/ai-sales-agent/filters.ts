import { AiSalesAgentConversationsFilterMember } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersFilterMember } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { AiSalesAgentOrderCustomersFilterMember } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrdersCustomers'
import { ConvertTrackingEventsDimension } from 'domains/reporting/models/cubes/convert/ConvertTrackingEventsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingFilter } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { StatsFiltersMembers } from 'domains/reporting/utils/reporting'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

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
        member: ConvertTrackingEventsDimension.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: ConvertTrackingEventsDimension.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]
