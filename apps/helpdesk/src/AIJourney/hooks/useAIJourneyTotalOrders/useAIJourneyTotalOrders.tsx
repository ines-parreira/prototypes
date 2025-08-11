import { aiJourneyTotalNumberOfOrderQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalOrders = (
    integrationId: string,
    userTimezone: string,
    filters: filterType,
    journeyId?: string,
): MetricProps => {
    const { data, isFetching } = useMetricTrend(
        aiJourneyTotalNumberOfOrderQueryFactory(
            integrationId,
            filters,
            userTimezone,
            journeyId,
        ),
        aiJourneyTotalNumberOfOrderQueryFactory(
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
        label: 'Total Orders',
        value: data?.value || 0,
        prevValue: data?.prevValue || 0,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetching,
    }
}
