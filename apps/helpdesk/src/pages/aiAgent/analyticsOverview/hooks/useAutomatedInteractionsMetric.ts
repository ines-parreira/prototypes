import type { MetricTrend } from '@repo/reporting'

import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'

export const useAutomatedInteractionsMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const automatedInteractionsTrend = useFilteredAutomatedInteractions(
        statsFilters,
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
