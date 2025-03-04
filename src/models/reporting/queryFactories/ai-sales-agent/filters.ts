import { AiSalesAgentConversationsFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersFilterMember } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

export const aiSalesAgentOrdersDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: AiSalesAgentOrdersFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: AiSalesAgentOrdersFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]

export const aiSalesAgentConversationsDefaultFilters = (
    filters: StatsFilters,
): ReportingFilter[] => [
    {
        member: AiSalesAgentConversationsFilterMember.PeriodStart,
        operator: ReportingFilterOperator.AfterDate,
        values: [formatReportingQueryDate(filters.period.start_datetime)],
    },
    {
        member: AiSalesAgentConversationsFilterMember.PeriodEnd,
        operator: ReportingFilterOperator.BeforeDate,
        values: [formatReportingQueryDate(filters.period.end_datetime)],
    },
]
