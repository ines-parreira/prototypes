import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDiscountCodesAverageValueTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'

export const useAverageDiscountAmountMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useDiscountCodesAverageValueTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Average discount amount',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
