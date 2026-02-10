import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTotalSalePerInteractionTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'

export const useRevenuePerInteractionMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useTotalSalePerInteractionTrend(
        statsFilters,
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
