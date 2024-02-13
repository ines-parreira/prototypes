import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'

export function useVoiceAgentsSummaryMetrics() {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )

    const totalCallsMetric = useTotalCallsMetric(
        cleanStatsFilters,
        userTimezone
    )
    const answeredCallsMetric = useAnsweredCallsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const missedCallsMetric = useMissedCallsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const declinedCallsMetric = useDeclinedCallsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const outboundCallsMetric = useOutboundCallsMetric(
        cleanStatsFilters,
        userTimezone
    )

    const averageTalkTimeMetric = useAverageTalkTimeMetric(
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
        summaryData: {
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
