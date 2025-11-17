import { useMemo } from 'react'

import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    useAnsweredCallsMetric,
    useAverageTalkTimeMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
    useTransferredInboundCallsMetric,
} from 'domains/reporting/pages/voice/hooks/agentMetrics'

export function useVoiceAgentsSummaryMetrics(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
) {
    const totalCallsMetric = useTotalCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const answeredCallsMetric = useAnsweredCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const transferredInboundCallsMetric = useTransferredInboundCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const missedCallsMetric = useMissedCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const declinedCallsMetric = useDeclinedCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const outboundCallsMetric = useOutboundCallsMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const averageTalkTimeMetric = useAverageTalkTimeMetric(
        cleanStatsFilters,
        userTimezone,
    )

    const loading = useMemo(() => {
        return Object.values({
            totalCallsMetric,
            answeredCallsMetric,
            transferredInboundCallsMetric,
            missedCallsMetric,
            declinedCallsMetric,
            outboundCallsMetric,
            averageTalkTimeMetric,
        }).some((metric) => metric.isFetching)
    }, [
        totalCallsMetric,
        answeredCallsMetric,
        transferredInboundCallsMetric,
        missedCallsMetric,
        declinedCallsMetric,
        outboundCallsMetric,
        averageTalkTimeMetric,
    ])

    return {
        summaryData: {
            totalCallsMetric,
            answeredCallsMetric,
            transferredInboundCallsMetric,
            missedCallsMetric,
            declinedCallsMetric,
            outboundCallsMetric,
            averageTalkTimeMetric,
        },
        isLoading: loading,
        period: cleanStatsFilters.period,
    }
}
