import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyRepliedMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIJourneyTotalReplies = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds?: string[],
): AIJourneyMetricResult => {
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
    )

    return {
        trend: {
            isFetching,
            isError: false,
            data: {
                label: 'Recipients who replied',
                value: isFetching ? null : (trendData?.value ?? null),
                prevValue: trendData?.prevValue ?? null,
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
