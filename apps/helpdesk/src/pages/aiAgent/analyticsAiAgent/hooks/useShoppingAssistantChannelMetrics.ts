import { useMemo } from 'react'

import {
    useAutomatedSalesConversationsPerChannel,
    useGmvInfluencedPerChannel,
    useTotalSalesConversationsPerChannel,
} from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import {
    useHandoverInteractionsFromConversationsPerChannel,
    useOrdersInfluencedPerChannel,
} from 'domains/reporting/hooks/ai-sales-agent/shoppingAssistantChannelMetrics'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export type ShoppingAssistantChannelMetrics = {
    channel: string
    automationRate: number | null
    aiAgentInteractionsShare: number | null
    automatedInteractions: number | null
    handover: number | null
    successRate: number | null
    totalSales: number | null
    ordersInfluenced: number | null
    revenuePerInteraction: number | null
}

export type ShoppingAssistantChannelPerformanceMetrics = {
    data: ShoppingAssistantChannelMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: {
        automationRate: boolean
        aiAgentInteractionsShare: boolean
        automatedInteractions: boolean
        handover: boolean
        totalSales: boolean
        ordersInfluenced: boolean
    }
}

const calculateAutomationRate = (
    automated: number | null,
    total: number | null,
): number | null => {
    if (automated === null || total === null || total === 0) {
        return null
    }
    return (automated / total) * 100
}

const calculateInteractionsShare = (
    channelInteractions: number | null,
    totalInteractions: number | null,
): number | null => {
    if (
        channelInteractions === null ||
        totalInteractions === null ||
        totalInteractions === 0
    ) {
        return null
    }
    return (channelInteractions / totalInteractions) * 100
}

const calculateRevenuePerInteraction = (
    totalSales: number | null,
    totalInteractions: number | null,
): number | null => {
    if (
        totalSales === null ||
        totalInteractions === null ||
        totalInteractions === 0
    ) {
        return null
    }
    return totalSales / totalInteractions
}

const parseNumericValue = (
    value: string | number | null | undefined,
): number | null => {
    if (value === null || value === undefined) {
        return null
    }
    return typeof value === 'string' ? parseFloat(value) : value
}

export const useShoppingAssistantChannelMetrics = (
    filters: StatsFilters,
    timezone: string,
): ShoppingAssistantChannelPerformanceMetrics => {
    const totalConversations = useTotalSalesConversationsPerChannel(
        filters,
        timezone,
    )
    const automatedConversations = useAutomatedSalesConversationsPerChannel(
        filters,
        timezone,
    )
    const handoverInteractions =
        useHandoverInteractionsFromConversationsPerChannel(filters, timezone)
    const gmvInfluenced = useGmvInfluencedPerChannel(filters, timezone)
    const ordersInfluenced = useOrdersInfluencedPerChannel(filters, timezone)

    const isLoading =
        totalConversations.isFetching ||
        automatedConversations.isFetching ||
        handoverInteractions.isFetching ||
        gmvInfluenced.isFetching ||
        ordersInfluenced.isFetching

    const isError =
        totalConversations.isError ||
        automatedConversations.isError ||
        handoverInteractions.isError ||
        gmvInfluenced.isError ||
        ordersInfluenced.isError

    const totalAllChannelInteractions = useMemo(() => {
        if (!totalConversations.data?.allData) return null
        return totalConversations.data.allData.reduce((sum, item) => {
            const count = parseNumericValue(
                item[AiSalesAgentConversationsMeasure.Count],
            )
            return sum + (count ?? 0)
        }, 0)
    }, [totalConversations.data])

    const data = useMemo(() => {
        const channelsSet = new Set<string>()

        totalConversations.data?.allData.forEach((item) => {
            const channel = item[AiSalesAgentConversationsDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        automatedConversations.data?.allData.forEach((item) => {
            const channel = item[AiSalesAgentConversationsDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        handoverInteractions.data?.allData.forEach((item) => {
            const channel = item[AiSalesAgentConversationsDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        gmvInfluenced.data?.allData.forEach((item) => {
            const channel = item[AiSalesAgentOrdersDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        ordersInfluenced.data?.allData.forEach((item) => {
            const channel = item[AiSalesAgentOrdersDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        const channels = Array.from(channelsSet).sort()

        return channels.map((channel): ShoppingAssistantChannelMetrics => {
            const totalData = totalConversations.data?.allData.find(
                (item) =>
                    item[AiSalesAgentConversationsDimension.Channel] ===
                    channel,
            )
            const automatedData = automatedConversations.data?.allData.find(
                (item) =>
                    item[AiSalesAgentConversationsDimension.Channel] ===
                    channel,
            )
            const handoverData = handoverInteractions.data?.allData.find(
                (item) =>
                    item[AiSalesAgentConversationsDimension.Channel] ===
                    channel,
            )
            const gmvData = gmvInfluenced.data?.allData.find(
                (item) => item[AiSalesAgentOrdersDimension.Channel] === channel,
            )
            const ordersData = ordersInfluenced.data?.allData.find(
                (item) => item[AiSalesAgentOrdersDimension.Channel] === channel,
            )

            const totalConversationsCount = parseNumericValue(
                totalData?.[AiSalesAgentConversationsMeasure.Count],
            )
            const automatedConversationsCount = parseNumericValue(
                automatedData?.[AiSalesAgentConversationsMeasure.Count],
            )
            const handoverCount = parseNumericValue(
                handoverData?.[AiSalesAgentConversationsMeasure.Count],
            )
            const totalSalesValue = parseNumericValue(
                gmvData?.[AiSalesAgentOrdersMeasure.GmvUsd],
            )
            const ordersInfluencedCount = parseNumericValue(
                ordersData?.[AiSalesAgentOrdersMeasure.Count],
            )

            const automationRate = calculateAutomationRate(
                automatedConversationsCount,
                totalConversationsCount,
            )

            const aiAgentInteractionsShare = calculateInteractionsShare(
                totalConversationsCount,
                totalAllChannelInteractions,
            )

            const revenuePerInteraction = calculateRevenuePerInteraction(
                totalSalesValue,
                totalConversationsCount,
            )

            return {
                channel,
                automationRate,
                aiAgentInteractionsShare,
                automatedInteractions: automatedConversationsCount,
                handover: handoverCount,
                successRate: automationRate,
                totalSales: totalSalesValue,
                ordersInfluenced: ordersInfluencedCount,
                revenuePerInteraction,
            }
        })
    }, [
        totalConversations.data,
        automatedConversations.data,
        handoverInteractions.data,
        gmvInfluenced.data,
        ordersInfluenced.data,
        totalAllChannelInteractions,
    ])

    const loadingStates = useMemo(
        () => ({
            automationRate:
                totalConversations.isFetching ||
                automatedConversations.isFetching,
            aiAgentInteractionsShare: totalConversations.isFetching,
            automatedInteractions: automatedConversations.isFetching,
            handover: handoverInteractions.isFetching,
            totalSales: gmvInfluenced.isFetching,
            ordersInfluenced: ordersInfluenced.isFetching,
        }),
        [
            totalConversations.isFetching,
            automatedConversations.isFetching,
            handoverInteractions.isFetching,
            gmvInfluenced.isFetching,
            ordersInfluenced.isFetching,
        ],
    )

    return {
        data,
        isLoading,
        isError,
        loadingStates,
    }
}
