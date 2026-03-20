import { useMemo } from 'react'

import { useAIJourneyOptOutAfterReply } from 'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply'
import { useAIJourneyTotalReplies } from 'AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies'
import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { calculateRatiusToPercentage } from 'AIJourney/utils'

type UseAIJourneyOptOutAfterReplyRateOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyOptOutAfterReplyRate = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyOptOutAfterReplyRateOptions): AIJourneyMetricResult => {
    const { trend: optedOutAfterReplyTrend } = useAIJourneyOptOutAfterReply({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const { trend: totalRepliesTrend } = useAIJourneyTotalReplies({
        integrationId,
        userTimezone,
        filters,
        journeyIds,
        forceEmpty,
    })

    const isFetching =
        optedOutAfterReplyTrend.isFetching || totalRepliesTrend.isFetching

    const rateValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutAfterReplyTrend.data?.value,
            denominator: totalRepliesTrend.data?.value,
        })
    }, [optedOutAfterReplyTrend.data, totalRepliesTrend.data])

    const ratePrevValue = useMemo(() => {
        return calculateRatiusToPercentage({
            numerator: optedOutAfterReplyTrend.data?.prevValue,
            denominator: totalRepliesTrend.data?.prevValue,
        })
    }, [optedOutAfterReplyTrend.data, totalRepliesTrend.data])

    return {
        trend: {
            isFetching,
            isError: false,
            data: {
                label: 'Opt-out rate after reply',
                value: isFetching ? null : rateValue,
                prevValue: ratePrevValue ?? null,
            },
        },
        interpretAs: 'less-is-better',
        metricFormat: 'percent',
        hint: {
            title: 'Percentage of recipients who unsubscribed after first replying to the message.',
        },
    }
}
