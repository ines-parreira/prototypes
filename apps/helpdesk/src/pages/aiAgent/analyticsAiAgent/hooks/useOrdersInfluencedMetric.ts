import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTotalNumberOfOrdersTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'

export const useOrdersInfluencedMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useTotalNumberOfOrdersTrend(
        cleanStatsFilters,
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
