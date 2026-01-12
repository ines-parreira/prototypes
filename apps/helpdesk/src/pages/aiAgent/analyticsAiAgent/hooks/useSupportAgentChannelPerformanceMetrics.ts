import { useMemo } from 'react'

import {
    useHandoverInteractionsPerChannel,
    useSnoozedInteractionsPerChannel,
} from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export type SupportAgentChannelMetrics = {
    channel: string
    handoverInteractions: number | null
    snoozedInteractions: number | null
}

export type SupportAgentChannelPerformanceMetrics = {
    data: SupportAgentChannelMetrics[]
    isLoading: boolean
    isError: boolean
    loadingStates: {
        handoverInteractions: boolean
        snoozedInteractions: boolean
    }
}

export const useSupportAgentChannelPerformanceMetrics = (
    filters: StatsFilters,
    timezone: string,
): SupportAgentChannelPerformanceMetrics => {
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

    const isLoading =
        handoverInteractions.isFetching || snoozedInteractions.isFetching

    const isError = handoverInteractions.isError || snoozedInteractions.isError

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

        const channels = Array.from(channelsSet).sort()

        const result = channels.map((channel): SupportAgentChannelMetrics => {
            const handoverData = handoverInteractions.data?.allData.find(
                (item) => item[TicketDimension.Channel] === channel,
            )
            const snoozedData = snoozedInteractions.data?.allData.find(
                (item) => item[TicketDimension.Channel] === channel,
            )

            const handoverCount =
                handoverData?.[
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                ] ?? null
            const snoozedCount =
                snoozedData?.[
                    TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount
                ] ?? null

            return {
                channel,
                handoverInteractions:
                    typeof handoverCount === 'string'
                        ? parseFloat(handoverCount)
                        : handoverCount,
                snoozedInteractions:
                    typeof snoozedCount === 'string'
                        ? parseFloat(snoozedCount)
                        : snoozedCount,
            }
        })

        return result
    }, [handoverInteractions.data, snoozedInteractions.data])

    const loadingStates = useMemo(
        () => ({
            handoverInteractions: handoverInteractions.isFetching,
            snoozedInteractions: snoozedInteractions.isFetching,
        }),
        [handoverInteractions.isFetching, snoozedInteractions.isFetching],
    )

    return {
        data,
        isLoading,
        isError,
        loadingStates,
    }
}
