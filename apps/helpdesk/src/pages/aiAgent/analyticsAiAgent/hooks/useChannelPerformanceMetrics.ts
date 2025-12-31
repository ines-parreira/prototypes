import { useMemo } from 'react'

import {
    useAutomatedSalesConversationsPerChannel,
    useGmvInfluencedPerChannel,
    useHandoverInteractionsPerChannel,
    useSnoozedInteractionsPerChannel,
    useTotalSalesConversationsPerChannel,
} from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export type ChannelMetrics = {
    channel: string
    handoverInteractions: number | null
    snoozedInteractions: number | null
    totalSales: number | null
    automationRate: number | null
}

export type ChannelPerformanceMetrics = {
    data: ChannelMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: {
        handoverInteractions: boolean
        snoozedInteractions: boolean
        totalSales: boolean
        automationRate: boolean
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

export const useChannelPerformanceMetrics = (
    filters: StatsFilters,
    timezone: string,
): ChannelPerformanceMetrics => {
    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const handoverInteractions = useHandoverInteractionsPerChannel(
        filters,
        timezone,
        outcomeCustomFieldId,
    )
    const snoozedInteractions = useSnoozedInteractionsPerChannel(
        filters,
        timezone,
        outcomeCustomFieldId,
    )
    const gmvInfluenced = useGmvInfluencedPerChannel(filters, timezone)
    const totalConversations = useTotalSalesConversationsPerChannel(
        filters,
        timezone,
    )
    const automatedConversations = useAutomatedSalesConversationsPerChannel(
        filters,
        timezone,
    )

    const isLoading =
        handoverInteractions.isFetching ||
        snoozedInteractions.isFetching ||
        gmvInfluenced.isFetching ||
        totalConversations.isFetching ||
        automatedConversations.isFetching

    const isError =
        handoverInteractions.isError ||
        snoozedInteractions.isError ||
        gmvInfluenced.isError ||
        totalConversations.isError ||
        automatedConversations.isError

    const data = useMemo(() => {
        const channelsSet = new Set<string>()

        handoverInteractions.data?.allData.forEach((item) => {
            const channel = item[TicketDimension.Channel]
            if (channel && typeof channel === 'string') {
                channelsSet.add(channel)
            }
        })

        snoozedInteractions.data?.allData.forEach((item) => {
            const channel = item[TicketDimension.Channel]
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

        const channels = Array.from(channelsSet).sort()

        const result = channels.map((channel): ChannelMetrics => {
            const handoverData = handoverInteractions.data?.allData.find(
                (item) => item[TicketDimension.Channel] === channel,
            )
            const snoozedData = snoozedInteractions.data?.allData.find(
                (item) => item[TicketDimension.Channel] === channel,
            )
            const gmvData = gmvInfluenced.data?.allData.find(
                (item) => item[AiSalesAgentOrdersDimension.Channel] === channel,
            )
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

            const handoverCount =
                handoverData?.[
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                ] ?? null
            const snoozedCount =
                snoozedData?.[
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                ] ?? null
            const totalSalesValue =
                gmvData?.[AiSalesAgentOrdersMeasure.GmvUsd] ?? null
            const totalConversationsCount =
                totalData?.[AiSalesAgentConversationsMeasure.Count] ?? null
            const automatedConversationsCount =
                automatedData?.[AiSalesAgentConversationsMeasure.Count] ?? null

            const automationRate = calculateAutomationRate(
                typeof automatedConversationsCount === 'string'
                    ? parseFloat(automatedConversationsCount)
                    : automatedConversationsCount,
                typeof totalConversationsCount === 'string'
                    ? parseFloat(totalConversationsCount)
                    : totalConversationsCount,
            )

            const metrics = {
                channel,
                handoverInteractions:
                    typeof handoverCount === 'string'
                        ? parseFloat(handoverCount)
                        : handoverCount,
                snoozedInteractions:
                    typeof snoozedCount === 'string'
                        ? parseFloat(snoozedCount)
                        : snoozedCount,
                totalSales:
                    typeof totalSalesValue === 'string'
                        ? parseFloat(totalSalesValue)
                        : totalSalesValue,
                automationRate,
            }
            return metrics
        })

        return result
    }, [
        handoverInteractions.data,
        snoozedInteractions.data,
        gmvInfluenced.data,
        totalConversations.data,
        automatedConversations.data,
    ])

    const loadingStates = useMemo(() => {
        const states = {
            handoverInteractions: handoverInteractions.isFetching,
            snoozedInteractions: snoozedInteractions.isFetching,
            totalSales: gmvInfluenced.isFetching,
            automationRate:
                totalConversations.isFetching ||
                automatedConversations.isFetching,
        }

        return states
    }, [
        handoverInteractions.isFetching,
        snoozedInteractions.isFetching,
        gmvInfluenced.isFetching,
        totalConversations.isFetching,
        automatedConversations.isFetching,
    ])

    return {
        data,
        isLoading,
        isError,
        loadingStates,
    }
}
