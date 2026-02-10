import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomatedSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend'

export const useResolvedInteractionsMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useAutomatedSalesConversationsTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Automated interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
