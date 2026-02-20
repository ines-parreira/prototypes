import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDiscountCodesRateAppliedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend'

export const useDiscountUsageMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useDiscountCodesRateAppliedTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Discount usage',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
