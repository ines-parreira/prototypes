import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {User} from 'config/types/user'
import useAppSelector from 'hooks/useAppSelector'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import {getSortedAgents} from 'state/ui/stats/agentPerformanceSlice'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export function useVoiceAgentsMetrics() {
    const isVoiceAgentsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersVoice]

    const {cleanStatsFilters: legacyStatsFilters, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithTimezone)
    const {cleanStatsFilters: statsFiltersWithLogicalOperators} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isVoiceAgentsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const agents = useAppSelector<User[]>(getSortedAgents)

    const totalCallsMetric = useTotalCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )
    const answeredCallsMetric = useAnsweredCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const missedCallsMetric = useMissedCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const declinedCallsMetric = useDeclinedCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const outboundCallsMetric = useOutboundCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const averageTalkTimeMetric = useAverageTalkTimeMetricPerAgent(
        cleanStatsFilters,
        userTimezone
    )

    const loading = useMemo(() => {
        return Object.values({
            totalCallsMetric,
            answeredCallsMetric,
            missedCallsMetric,
            declinedCallsMetric,
            outboundCallsMetric,
            averageTalkTimeMetric,
        }).some((metric) => metric.isFetching)
    }, [
        totalCallsMetric,
        answeredCallsMetric,
        missedCallsMetric,
        declinedCallsMetric,
        outboundCallsMetric,
        averageTalkTimeMetric,
    ])

    return {
        reportData: {
            agents,
            totalCallsMetric,
            answeredCallsMetric,
            missedCallsMetric,
            declinedCallsMetric,
            outboundCallsMetric,
            averageTalkTimeMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
