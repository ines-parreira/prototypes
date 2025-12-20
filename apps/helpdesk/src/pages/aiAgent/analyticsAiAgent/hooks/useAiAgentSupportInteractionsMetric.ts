import type { MetricTrend } from '@repo/reporting'

import { useAiAgentSupportInteractionsTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAiAgentSupportInteractionsMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useAiAgentSupportInteractionsTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Support interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
