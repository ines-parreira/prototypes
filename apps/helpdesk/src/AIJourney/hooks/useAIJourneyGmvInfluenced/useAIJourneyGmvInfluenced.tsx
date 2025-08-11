import { aiJourneyGmvInfluencedQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyGmvInfluenced = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
    journeyId?: string,
): MetricProps => {
    const { currency } = useCurrency()

    const { data, isFetching } = useMetricTrend(
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyGmvInfluencedQueryFactory(
            integrationId,
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
            journeyId,
        ),
    )

    return {
        label: 'Total Revenue',
        value: data?.value || 0,
        prevValue: data?.prevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: isFetching,
    }
}
