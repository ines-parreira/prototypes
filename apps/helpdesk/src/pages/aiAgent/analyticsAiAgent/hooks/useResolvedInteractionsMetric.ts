import type { MetricTrend } from '@repo/reporting'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAutomatedSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend'

export const useResolvedInteractionsMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useAutomatedSalesConversationsTrend(
        cleanStatsFilters,
        userTimezone,
    )

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
