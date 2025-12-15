import type { MetricTrend } from '@repo/reporting'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAutomationRateMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const automationRateTrend = useAIAgentAutomationRateTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: automationRateTrend.isFetching,
        isError: automationRateTrend.isError,
        data: {
            label: 'Overall automation rate',
            value: automationRateTrend.data?.value ?? null,
            prevValue: automationRateTrend.data?.prevValue ?? null,
        },
    }
}
