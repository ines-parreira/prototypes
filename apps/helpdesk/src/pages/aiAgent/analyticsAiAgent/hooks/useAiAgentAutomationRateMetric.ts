import type { MetricTrend } from '@repo/reporting'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAiAgentAutomationRateMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useAIAgentAutomationRateTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: data
            ? {
                  label: 'Automation rate',
                  value: data.value,
                  prevValue: data.prevValue,
              }
            : undefined,
    }
}
