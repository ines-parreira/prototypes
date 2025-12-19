import type { MetricTrend } from '@repo/reporting'

import { useAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAiAgentTimeSavedMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useAiAgentTimeSavedByAgentsTrend(
        cleanStatsFilters,
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
