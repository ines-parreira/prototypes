import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export const useNewAutomateFilters = (): {
    statsFilters: StatsFilters
    userTimezone: string
    granularity: ReportingGranularity
    isAnalyticsNewFiltersAutomate: boolean
} => {
    const isAnalyticsNewFiltersAutomate: boolean | undefined =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersAutomate]
    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators,
    )
    const {
        cleanStatsFilters: legacyStatsFilters,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const { cleanStatsFilters: statsFiltersWithLogicalOperators } =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const pageStatsFilters = useMemo(() => {
        if (isAnalyticsNewFiltersAutomate) {
            const { channels, period } = statsFiltersWithLogicalOperators
            return {
                channels:
                    channels !== undefined
                        ? channels
                        : withDefaultLogicalOperator([]),
                period,
            }
        }
        const { channels, period } = legacyStatsFilters
        return {
            channels: channels !== undefined ? channels : [],
            period,
        }
    }, [
        isAnalyticsNewFiltersAutomate,
        legacyStatsFilters,
        statsFiltersWithLogicalOperators,
    ])

    return {
        statsFilters: pageStatsFilters,
        userTimezone,
        granularity,
        isAnalyticsNewFiltersAutomate,
    }
}
