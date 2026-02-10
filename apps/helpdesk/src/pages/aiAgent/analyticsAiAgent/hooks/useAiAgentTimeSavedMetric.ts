import type { MetricTrend } from '@repo/reporting'

import { useAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'

export const useAiAgentTimeSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useAiAgentTimeSavedByAgentsTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Time saved by agents',
            value: data.value,
            prevValue: data.prevValue,
        },
    }
}
