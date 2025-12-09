import type { MetricTrend } from '@repo/reporting'

import { useTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useTimeSavedMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useTimeSavedByAgentsTrend(
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
