import { useMemo } from 'react'

import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    useAnsweredCallsMetricPerAgent,
    useAverageTalkTimeMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
    useTransferredInboundCallsMetricPerAgent,
} from 'domains/reporting/pages/voice/hooks/metricsPerDimension'

export function useVoiceAgentsMetrics(
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
) {
    const totalCallsMetric = useTotalCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const answeredCallsMetric = useAnsweredCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const transferredInboundCallsMetric =
        useTransferredInboundCallsMetricPerAgent(
            cleanStatsFilters,
            userTimezone,
        )

    const missedCallsMetric = useMissedCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const declinedCallsMetric = useDeclinedCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const outboundCallsMetric = useOutboundCallsMetricPerAgent(
        cleanStatsFilters,
        userTimezone,
    )

    const averageTalkTimeMetric = useAverageTalkTimeMetricPerAgent(
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
        reportData: {
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
