import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'

export const useTimeSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useTimeSavedByAgentsTrend(
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
