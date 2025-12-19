import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTotalSalePerInteractionTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'

export const useRevenuePerInteractionMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useTotalSalePerInteractionTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Revenue per interaction',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
