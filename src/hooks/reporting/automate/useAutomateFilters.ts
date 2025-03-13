import { useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

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
