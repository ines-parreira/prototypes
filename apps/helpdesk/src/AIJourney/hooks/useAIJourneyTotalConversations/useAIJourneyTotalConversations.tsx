import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyTotalConversationsQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalConversationsOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyTotalConversations = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalConversationsOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

    const { data: trendData, isFetching } = useMetricTrend(
        aiJourneyTotalConversationsQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyTotalConversationsQueryFactory(
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
                label: 'Recipients',
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
            title: 'Unique customers who received at least 1 message during the selected date range.',
        },
        drilldownMetricName: AIJourneyMetric.TotalConversations,
    }
}
