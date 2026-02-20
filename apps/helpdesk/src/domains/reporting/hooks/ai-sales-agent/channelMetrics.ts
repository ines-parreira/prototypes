import {
    useMetricPerDimension,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    automatedSalesConversationsPerChannelQueryFactory,
    gmvInfluencedPerChannelQueryFactory,
    handoverInteractionsPerChannelQueryFactory,
    snoozedInteractionsPerChannelQueryFactory,
    totalSalesConversationsPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/channelMetrics'
import {
    AISalesAgentAutomatedSalesConversationsPerChannelQueryFactoryV2,
    AISalesAgentTotalSalesConversationsPerChannelQueryFactoryV2,
} from 'domains/reporting/models/scopes/AISalesAgentConversations'
import { AISalesAgentGMVInfluencedPerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    channel?: string,
) => {
    return useMetricPerDimension(
        handoverInteractionsPerChannelQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
        ),
        channel,
    )
}

export const useSnoozedInteractionsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    channel?: string,
) => {
    return useMetricPerDimension(
        snoozedInteractionsPerChannelQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
        ),
        channel,
    )
}

export const useGmvInfluencedPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimensionV2(
        gmvInfluencedPerChannelQueryFactory(filters, timezone),
        AISalesAgentGMVInfluencedPerChannelQueryFactoryV2({
            filters,
            timezone,
        }),
        channel,
    )
}

export const useTotalSalesConversationsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimensionV2(
        totalSalesConversationsPerChannelQueryFactory(filters, timezone),
        AISalesAgentTotalSalesConversationsPerChannelQueryFactoryV2({
            filters,
            timezone,
        }),
        channel,
    )
}

export const useAutomatedSalesConversationsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimensionV2(
        automatedSalesConversationsPerChannelQueryFactory(filters, timezone),
        AISalesAgentAutomatedSalesConversationsPerChannelQueryFactoryV2({
            filters,
            timezone,
        }),
        channel,
    )
}
