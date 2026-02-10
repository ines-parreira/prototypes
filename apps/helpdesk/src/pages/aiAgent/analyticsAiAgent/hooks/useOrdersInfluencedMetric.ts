import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTotalNumberOfOrdersTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'

export const useOrdersInfluencedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useTotalNumberOfOrdersTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Orders influenced',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
