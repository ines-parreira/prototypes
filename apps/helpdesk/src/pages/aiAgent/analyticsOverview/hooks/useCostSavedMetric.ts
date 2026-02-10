import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'

export const useCostSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useAutomationCostSavedTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching: isFetching,
        isError: isError,
        data: {
            label: 'Cost saved',
            value: data.value,
            prevValue: data.prevValue,
        },
    }
}
