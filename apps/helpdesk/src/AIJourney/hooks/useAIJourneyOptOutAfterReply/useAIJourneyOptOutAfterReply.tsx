import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyOptedOutAfterReplyQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyOptOutAfterReplyOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyOptOutAfterReply = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyOptOutAfterReplyOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

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
        undefined,
        undefined,
        enabled,
    )

    return {
        trend: {
            isFetching: forceEmpty ? false : isFetching,
            isError: false,
            data: {
                label: 'Opted-out after reply',
                value: forceEmpty
                    ? 0
                    : isFetching
                      ? null
                      : (trendData?.value ?? null),
                prevValue: forceEmpty ? 0 : (trendData?.prevValue ?? null),
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
