import type { MetricTrend } from '@repo/reporting'

import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useDecreaseInFirstResponseTimeMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, isError, data } = useDecreaseInFirstResponseTimeTrend(
        cleanStatsFilters,
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
