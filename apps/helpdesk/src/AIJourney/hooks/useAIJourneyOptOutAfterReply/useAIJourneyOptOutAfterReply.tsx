import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyOptedOutAfterReplyQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAIJourneyOptOutAfterReply = (
    integrationId: string,
    userTimezone: string,
    filters: FilterType,
    journeyIds?: string[],
): AIJourneyMetricResult => {
    const { data: trendData, isFetching } = useMetricTrend(
        aiJourneyOptedOutAfterReplyQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyOptedOutAfterReplyQueryFactory(
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
                label: 'Opted-out after reply',
                value: isFetching ? null : (trendData?.value ?? null),
                prevValue: trendData?.prevValue ?? null,
            },
        },
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        hint: {
            title: 'The number of recipients who replied to the message and then unsubscribed.',
        },
        drilldownMetricName: AIJourneyMetric.OptOutAfterReply,
    }
}
