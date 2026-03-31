import { useMemo } from 'react'

import { JOURNEY_COMPLETE_REASON } from 'AIJourney/constants'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyRepliedMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import type { AiSalesAgentConversationsCube } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalRepliesOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

const sumRepliesExcludingOptedOut = (
    allData: Record<string, string | number | null>[] | undefined,
): number => {
    if (!allData) return 0
    return allData.reduce((total, rawRow) => {
        const replyCount = rawRow[AiSalesAgentConversationsDimension.ReplyCount]
        const journeyCompleteReason = rawRow[
            AiSalesAgentConversationsDimension.JourneyCompleteReason
        ] as string
        const isOptedOutAfterOneReply =
            String(replyCount) === '1' &&
            journeyCompleteReason === JOURNEY_COMPLETE_REASON.OPTED_OUT
        if (isOptedOutAfterOneReply) return total
        return (
            total +
            (parseFloat(
                (rawRow[AiSalesAgentConversationsMeasure.Count] as string) ??
                    '0',
            ) || 0)
        )
    }, 0)
}

export const useAIJourneyTotalReplies = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalRepliesOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

    const repliedDimensions = [
        AiSalesAgentConversationsDimension.ReplyCount,
        AiSalesAgentConversationsDimension.JourneyCompleteReason,
    ]

    const { data: currentData, isFetching: isFetchingCurrent } =
        useMetricPerDimension<string, AiSalesAgentConversationsCube>(
            {
                ...aiJourneyRepliedMessagesQueryFactory(
                    integrationId,
                    filters,
                    userTimezone,
                    journeyIds,
                ),
                dimensions: repliedDimensions,
            },
            undefined,
            enabled,
        )

    const { data: prevData, isFetching: isFetchingPrev } =
        useMetricPerDimension<string, AiSalesAgentConversationsCube>(
            {
                ...aiJourneyRepliedMessagesQueryFactory(
                    integrationId,
                    {
                        ...filters,
                        period: getPreviousPeriod(filters.period),
                    },
                    userTimezone,
                    journeyIds,
                ),
                dimensions: repliedDimensions,
            },
            undefined,
            enabled,
        )

    const value = useMemo(
        () =>
            sumRepliesExcludingOptedOut(
                currentData?.allData as Record<
                    string,
                    string | number | null
                >[],
            ),
        [currentData],
    )

    const prevValue = useMemo(
        () =>
            sumRepliesExcludingOptedOut(
                prevData?.allData as Record<string, string | number | null>[],
            ),
        [prevData],
    )

    const isFetching = isFetchingCurrent || isFetchingPrev

    return {
        trend: {
            isFetching: forceEmpty ? false : isFetching,
            isError: false,
            data: {
                label: 'Recipients who replied',
                value: forceEmpty ? 0 : isFetching ? null : value,
                prevValue: forceEmpty ? 0 : isFetching ? null : prevValue,
            },
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        hint: {
            title: 'The number of recipients who sent a reply to the received message.',
        },
        drilldownMetricName: AIJourneyMetric.TotalReplies,
    }
}
