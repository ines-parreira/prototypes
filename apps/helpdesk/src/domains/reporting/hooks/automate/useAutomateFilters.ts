import { useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export const useAutomateFilters = (): {
    statsFilters: StatsFilters
    userTimezone: string
    granularity: ReportingGranularity
} => {
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useStatsFilters()

    const pageStatsFilters = useMemo(() => {
        return {
            period: statsFiltersWithLogicalOperators.period,
        }
    }, [statsFiltersWithLogicalOperators])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
    }
}
