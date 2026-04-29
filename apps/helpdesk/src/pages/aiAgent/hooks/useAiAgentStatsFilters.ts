import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export const useAiAgentStatsFilters = (): {
    statsFilters: StatsFilters
    userTimezone: string
    granularity: ReportingGranularity
} => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const { value: isFiltersEnabled, isLoading: isFiltersFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsFilters)

    const pageStatsFilters = useMemo(() => {
        return {
            period: cleanStatsFilters.period,
            ...(!isFiltersFFLoading && isFiltersEnabled
                ? { stores: cleanStatsFilters.stores }
                : {}),
        }
    }, [cleanStatsFilters, isFiltersEnabled, isFiltersFFLoading])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
    }
}
