import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
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
    const {
        cleanStatsFilters: legacyStatsFilters,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const {cleanStatsFilters: statsFiltersWithLogicalOperators} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const pageStatsFilters = useMemo(() => {
        if (isAnalyticsNewFiltersAutomate) {
            const {channels, period} = statsFiltersWithLogicalOperators
            return {
                channels:
                    channels !== undefined
                        ? channels
                        : withDefaultLogicalOperator([]),
                period,
            }
        }
        const {channels, period} = legacyStatsFilters
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
