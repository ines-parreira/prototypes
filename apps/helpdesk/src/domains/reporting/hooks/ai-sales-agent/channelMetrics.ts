import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    automatedSalesConversationsPerChannelQueryFactory,
    gmvInfluencedPerChannelQueryFactory,
    handoverInteractionsPerChannelQueryFactory,
    snoozedInteractionsPerChannelQueryFactory,
    totalSalesConversationsPerChannelQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/channelMetrics'
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
    return useMetricPerDimension(
        gmvInfluencedPerChannelQueryFactory(filters, timezone),
        channel,
    )
}

export const useTotalSalesConversationsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimension(
        totalSalesConversationsPerChannelQueryFactory(filters, timezone),
        channel,
    )
}

export const useAutomatedSalesConversationsPerChannel = (
    filters: StatsFilters,
    timezone: string,
    channel?: string,
) => {
    return useMetricPerDimension(
        automatedSalesConversationsPerChannelQueryFactory(filters, timezone),
        channel,
    )
}
