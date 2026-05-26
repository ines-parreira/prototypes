import { useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import {
    isPeriodBeforeDate,
    STORES_FILTER_AVAILABILITY_DATE,
} from 'domains/reporting/pages/common/filters/utils'

export const useAiAgentStatsFilters = (): {
    statsFilters: StatsFilters
    userTimezone: string
    granularity: ReportingGranularity
} => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const pageStatsFilters = useMemo(() => {
        const isStoresAvailable = !isPeriodBeforeDate({
            period: cleanStatsFilters.period,
            date: STORES_FILTER_AVAILABILITY_DATE,
        })

        return {
            period: cleanStatsFilters.period,
            channels: cleanStatsFilters.channels,
            ...(isStoresAvailable ? { stores: cleanStatsFilters.stores } : {}),
        }
    }, [cleanStatsFilters])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
    }
}
