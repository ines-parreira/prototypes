import type { MetricTrend } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'

export const useAutomationRateMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return {
        isFetching: automationRateTrend.isFetching,
        isError: automationRateTrend.isError,
        data: {
            label: 'Overall automation rate',
            value: automationRateTrend.data?.value ?? null,
            prevValue: automationRateTrend.data?.prevValue ?? null,
        },
    }
}
