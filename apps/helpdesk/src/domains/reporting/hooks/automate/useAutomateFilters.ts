import { useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export const useAutomateFilters = (): {
    statsFilters: StatsFilters
    userTimezone: string
    granularity: ReportingGranularity
} => {
    useCleanStatsFilters()

    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useStatsFilters()

    const pageStatsFilters = useMemo(() => {
        const { channels, period } = statsFiltersWithLogicalOperators
        return {
            channels:
                channels !== undefined
                    ? channels
                    : withDefaultLogicalOperator([]),
            period,
        }
    }, [statsFiltersWithLogicalOperators])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
    }
}
