import type { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import type { AIJourneyMetricResult } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyOptedOutQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type UseAIJourneyTotalOptOutsOptions = {
    integrationId: string
    userTimezone: string
    filters: FilterType
    journeyIds?: string[]
    forceEmpty?: boolean
}

export const useAIJourneyTotalOptOuts = ({
    integrationId,
    userTimezone,
    filters,
    journeyIds,
    forceEmpty = false,
}: UseAIJourneyTotalOptOutsOptions): AIJourneyMetricResult => {
    const enabled = !forceEmpty

    const { data: trendData, isFetching } = useMetricTrend(
        aiJourneyOptedOutQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyIds,
        ),
        aiJourneyOptedOutQueryFactory(
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
                label: 'Total opted-out',
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
            title: 'Total number of recipients who unsubscribed after receiving a message.',
        },
        drilldownMetricName: AIJourneyMetric.TotalOptOuts,
    }
}
