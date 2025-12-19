import type { MetricTrend } from '@repo/reporting'

import { useAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAiAgentAutomatedInteractionsMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useAIAgentAutomatedInteractionsTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Automated interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
