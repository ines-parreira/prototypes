import { aiJourneyTotalNumberOfOrderQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { filterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalOrders = (
    userTimezone: string,
    filters: filterType,
): MetricProps => {
    const { data, isFetching } = useMetricTrend(
        aiJourneyTotalNumberOfOrderQueryFactory(filters, userTimezone),
        aiJourneyTotalNumberOfOrderQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            userTimezone,
        ),
    )

    return {
        label: 'Total Orders',
        value: data?.value,
        prevValue: data?.prevValue,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetching,
    }
}
