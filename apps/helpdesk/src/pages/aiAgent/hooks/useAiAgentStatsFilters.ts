import { useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

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
    const { value: isFiltersEnabled, isLoading: isFiltersFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsFilters)

    const pageStatsFilters = useMemo(() => {
        const isStoresAvailable =
            !isFiltersFFLoading &&
            isFiltersEnabled &&
            !isPeriodBeforeDate({
                period: cleanStatsFilters.period,
                date: STORES_FILTER_AVAILABILITY_DATE,
            })

        return {
            period: cleanStatsFilters.period,
            ...(!isFiltersFFLoading && isFiltersEnabled
                ? { channels: cleanStatsFilters.channels }
                : {}),
            ...(isStoresAvailable ? { stores: cleanStatsFilters.stores } : {}),
        }
    }, [cleanStatsFilters, isFiltersEnabled, isFiltersFFLoading])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
    }
}
