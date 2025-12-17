import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTotalNumberOfSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'

export const useResolvedInteractionsMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } =
        useTotalNumberOfSalesConversationsTrend(cleanStatsFilters, userTimezone)

    return {
        isFetching,
        isError,
        data: {
            label: 'Resolved interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
