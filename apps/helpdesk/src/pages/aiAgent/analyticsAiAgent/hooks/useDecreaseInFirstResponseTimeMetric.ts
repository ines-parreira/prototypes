import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'

export const useDecreaseInFirstResponseTimeMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { isFetching, isError, data } = useDecreaseInFirstResponseTimeTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching,
        isError,
        data: {
            label: 'Decrease in first response time',
            value: data.value,
            prevValue: data.prevValue,
        },
    }
}
