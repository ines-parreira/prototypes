import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyRepliedMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalRepliesOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyTotalReplies = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalRepliesOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

    const { data: trendData, isFetching } = useMetricTrend(
        aiJourneyRepliedMessagesQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyRepliedMessagesQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyIds,
        ),
        undefined,
        undefined,
        enabled,
    )

    return {
        trend: {
            isFetching: forceEmpty ? false : isFetching,
            isError: false,
            data: {
                label: 'Recipients who replied',
                value: forceEmpty
                    ? 0
                    : isFetching
                      ? null
                      : (trendData?.value ?? null),
                prevValue: forceEmpty ? 0 : (trendData?.prevValue ?? null),
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
