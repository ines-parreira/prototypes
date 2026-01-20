import { useMemo } from 'react'

import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { calculateRate } from 'AIJourney/utils'
import {
    aiJourneyConversationMesuresPerJourneyQueryFactory,
    aiJourneyOrderMeasuresPerJourneyQueryFactory,
} from 'AIJourney/utils/analytics-factories/factories'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

export type Metrics = {
    recipients: number
    ctr: number
    replyRate: number
    optOutRate: number
    messagesSent: number
    revenue: number
    totalOrders: number
    averageOrderValue: number
    revenuePerRecipient: number
    conversionRate: number
}

type ConversationMeasureData = Record<
    | AiSalesAgentConversationsDimension.JourneyId
    | AiSalesAgentConversationsMeasure,
    string
>

type OrderMeasureData = Record<
    AiSalesAgentOrdersDimension.JourneyId | AiSalesAgentOrdersMeasure,
    string
>

export type TableKpisReturn = {
    metrics: Record<string, Metrics>
    isLoading: boolean
}

export const DEFAULT_TABLE_METRICS: Metrics = {
    recipients: 0,
    ctr: 0,
    replyRate: 0,
    optOutRate: 0,
    messagesSent: 0,
    revenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenuePerRecipient: 0,
    conversionRate: 0,
}

export const useAIJourneyTableKpis = ({
    integrationId,
    filters,
    journeyIds,
    enabled,
}: {
    integrationId: string
    filters: FilterType
    journeyIds?: string[]
    enabled?: boolean
}): TableKpisReturn => {
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const conversationQuery =
        aiJourneyConversationMesuresPerJourneyQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        )

    const orderQuery = aiJourneyOrderMeasuresPerJourneyQueryFactory(
        integrationId,
        filters,
        userTimezone,
        journeyIds,
    )

    const { data: conversationData, isFetching: isFetchingConversations } =
        usePostReportingV2<
            ConversationMeasureData[],
            UsePostReportingQueryData<ConversationMeasureData[]>
        >([conversationQuery], undefined, { enabled })

    const { data: orderData, isFetching: isFetchingOrders } =
        usePostReportingV2<
            OrderMeasureData[],
            UsePostReportingQueryData<OrderMeasureData[]>
        >([orderQuery], undefined, { enabled })

    const metrics: Record<string, Metrics> = useMemo(() => {
        const result: Record<string, Metrics> = {}

        const conversationRows = conversationData?.data.data || []
        const orderRows = orderData?.data.data || []

        conversationRows.forEach((row) => {
            const journeyId = row[AiSalesAgentConversationsDimension.JourneyId]
            const recipients = parseFloat(
                row[AiSalesAgentConversationsMeasure.Count] || '0',
            )
            const messagesSent = parseFloat(
                row[AiSalesAgentConversationsMeasure.AiJourneyTotalMessages] ||
                    '0',
            )
            const ctr = parseFloat(
                row[AiSalesAgentConversationsMeasure.ClickThroughRate] || '0',
            )
            const replyRate = parseFloat(
                row[AiSalesAgentConversationsMeasure.ReplyRate] || '0',
            )
            const optOutRate = parseFloat(
                row[AiSalesAgentConversationsMeasure.OptOutRate] || '0',
            )

            result[journeyId] = {
                ...DEFAULT_TABLE_METRICS,
                recipients,
                messagesSent,
                ctr,
                replyRate,
                optOutRate,
            }
        })

        orderRows.forEach((row) => {
            const journeyId = row[AiSalesAgentOrdersDimension.JourneyId]
            const revenue = parseFloat(
                row[AiSalesAgentOrdersMeasure.Gmv] || '0',
            )
            const totalOrders = parseFloat(
                row[AiSalesAgentOrdersMeasure.Count] || '0',
            )
            const averageOrderValue = parseFloat(
                row[AiSalesAgentOrdersMeasure.AverageOrderValue] || '0',
            )

            if (result[journeyId]) {
                result[journeyId].revenue = revenue
                result[journeyId].totalOrders = totalOrders
                result[journeyId].averageOrderValue = averageOrderValue
                result[journeyId].revenuePerRecipient = calculateRate({
                    numerator: revenue,
                    denominator: result[journeyId].recipients,
                })
                result[journeyId].conversionRate = calculateRate({
                    numerator: totalOrders,
                    denominator: result[journeyId].recipients,
                })
            } else {
                result[journeyId] = {
                    ...DEFAULT_TABLE_METRICS,
                    revenue,
                    totalOrders,
                    averageOrderValue,
                }
            }
        })

        return result
    }, [conversationData, orderData])

    return {
        metrics,
        isLoading: isFetchingConversations || isFetchingOrders,
    }
}
