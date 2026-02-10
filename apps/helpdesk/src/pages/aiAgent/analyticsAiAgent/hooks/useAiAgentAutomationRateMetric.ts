import type { MetricTrend } from '@repo/reporting'

import { useAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'

export const useAiAgentAutomationRateMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useAIAgentAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Automation rate',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}
