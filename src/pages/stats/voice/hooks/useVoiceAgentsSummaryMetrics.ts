import {useMemo} from 'react'

import {
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'

export function useVoiceAgentsSummaryMetrics() {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()

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
