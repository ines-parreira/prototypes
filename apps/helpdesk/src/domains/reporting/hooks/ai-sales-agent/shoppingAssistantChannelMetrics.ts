import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    handoverInteractionsFromConversationsPerChannelQueryFactory,
    ordersInfluencedPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/shoppingAssistantChannelMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsFromConversationsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimension(
        handoverInteractionsFromConversationsPerChannelQueryFactory(
            filters,
            timezone,
        ),
        channel,
    )
}

export const useOrdersInfluencedPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimension(
        ordersInfluencedPerChannelQueryFactory(filters, timezone),
        channel,
    )
}
