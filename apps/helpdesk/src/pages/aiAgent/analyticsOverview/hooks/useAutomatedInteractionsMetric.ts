import type { MetricTrend } from '@repo/reporting'

import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

export const useAutomatedInteractionsMetric = (): MetricTrend => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const automatedInteractionsTrend = useFilteredAutomatedInteractions(
        cleanStatsFilters,
        userTimezone,
    )

    return {
        isFetching: automatedInteractionsTrend.isFetching,
        isError: automatedInteractionsTrend.isError,
        data: automatedInteractionsTrend.data
            ? {
                  label: 'Automated interactions',
                  value: automatedInteractionsTrend.data.value,
                  prevValue: automatedInteractionsTrend.data.prevValue,
              }
            : undefined,
    }
}
