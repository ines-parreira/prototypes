import { aiJourneyGmvInfluencedQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyGmvInfluenced = (
    userTimezone: string,
    filters: filterType,
): MetricProps => {
    const { currency } = useCurrency()

    const { data, isFetching } = useMetricTrend(
        aiJourneyGmvInfluencedQueryFactory(filters, userTimezone),
        aiJourneyGmvInfluencedQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
        ),
    )

    return {
        label: 'Total Revenue',
        value: data?.value,
        prevValue: data?.prevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency,
        isLoading: isFetching,
    }
}
