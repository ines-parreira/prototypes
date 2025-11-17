import { useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { Period } from 'domains/reporting/models/stat/types'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import {
    ABANDONED_CALLS_METRIC_TITLE,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
    CANCELLED_CALLS_METRIC_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    UNANSWERED_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_REPORT_FILE_NAME,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallAverageTimeTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import { VoiceCallAverageTimeMetric } from 'domains/reporting/pages/voice/models/types'
import {
    CURRENT_PERIOD_LABEL,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'domains/reporting/services/constants'
import { createCsv } from 'utils/file'

interface VoiceReportData {
    totalCallsCountTrend: MetricTrend
    outboundCallsCountTrend: MetricTrend
    inboundCallsCountTrend: MetricTrend
    unansweredCallsCountTrend: MetricTrend
    missedCallsCountTrend: MetricTrend
    cancelledCallsCountTrend: MetricTrend
    abandonedCallsCountTrend: MetricTrend
    callbackRequestedCallsCountTrend: MetricTrend
    averageWaitTimeTrend: MetricTrend
    averageTalkTimeTrend: MetricTrend
}

const saveReport = (data: VoiceReportData, period: Period) => {
    const {
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        unansweredCallsCountTrend,
        missedCallsCountTrend,
        cancelledCallsCountTrend,
        abandonedCallsCountTrend,
        callbackRequestedCallsCountTrend,
        averageWaitTimeTrend,
        averageTalkTimeTrend,
    } = data

    const formatIntegerValue = (value?: number | null) =>
        value !== undefined
            ? formatMetricValue(value, 'integer')
            : NOT_AVAILABLE_LABEL
    const formatDecimalValue = (value?: number | null) =>
        value ? formatMetricValue(value) : NOT_AVAILABLE_LABEL

    const voiceOverviewData = [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            TOTAL_CALLS_METRIC_TITLE,
            formatIntegerValue(totalCallsCountTrend.data?.value),
            formatIntegerValue(totalCallsCountTrend.data?.prevValue),
        ],
        [
            OUTBOUND_CALLS_METRIC_TITLE,
            formatIntegerValue(outboundCallsCountTrend.data?.value),
            formatIntegerValue(outboundCallsCountTrend.data?.prevValue),
        ],
        [
            INBOUND_CALLS_METRIC_TITLE,
            formatIntegerValue(inboundCallsCountTrend.data?.value),
            formatIntegerValue(inboundCallsCountTrend.data?.prevValue),
        ],
        [
            UNANSWERED_CALLS_METRIC_TITLE,
            formatIntegerValue(unansweredCallsCountTrend.data?.value),
            formatIntegerValue(unansweredCallsCountTrend.data?.prevValue),
        ],
        [
            MISSED_CALLS_METRIC_TITLE,
            formatIntegerValue(missedCallsCountTrend.data?.value),
            formatIntegerValue(missedCallsCountTrend.data?.prevValue),
        ],
        [
            CANCELLED_CALLS_METRIC_TITLE,
            formatIntegerValue(cancelledCallsCountTrend.data?.value),
            formatIntegerValue(cancelledCallsCountTrend.data?.prevValue),
        ],
        [
            ABANDONED_CALLS_METRIC_TITLE,
            formatIntegerValue(abandonedCallsCountTrend.data?.value),
            formatIntegerValue(abandonedCallsCountTrend.data?.prevValue),
        ],
        [
            CALLBACK_REQUESTED_CALLS_METRIC_TITLE,
            formatIntegerValue(callbackRequestedCallsCountTrend.data?.value),
            formatIntegerValue(
                callbackRequestedCallsCountTrend.data?.prevValue,
            ),
        ],
        [
            AVERAGE_WAIT_TIME_METRIC_TITLE,
            formatDecimalValue(averageWaitTimeTrend.data?.value),
            formatDecimalValue(averageWaitTimeTrend.data?.prevValue),
        ],
        [
            AVERAGE_TALK_TIME_METRIC_TITLE,
            formatDecimalValue(averageTalkTimeTrend.data?.value),
            formatDecimalValue(averageTalkTimeTrend.data?.prevValue),
        ],
    ]

    const downloadFileName = getCsvFileNameWithDates(
        period,
        VOICE_OVERVIEW_REPORT_FILE_NAME,
    )

    return {
        files: {
            [getCsvFileNameWithDates(period, VOICE_OVERVIEW_REPORT_FILE_NAME)]:
                createCsv(voiceOverviewData),
        },
        fileName: downloadFileName,
    }
}

export const useVoiceOverviewReportData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
    )
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls,
    )
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls,
    )
    const unansweredCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundUnansweredCalls,
    )
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundMissedCalls,
    )
    const cancelledCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCancelledCalls,
    )
    const abandonedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundAbandonedCalls,
    )
    const callbackRequestedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCallbackRequestedCalls,
    )
    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone,
    )
    const averageTalkTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.TalkTime,
        cleanStatsFilters,
        userTimezone,
    )

    const exportableData = useMemo(() => {
        return {
            totalCallsCountTrend,
            outboundCallsCountTrend,
            inboundCallsCountTrend,
            unansweredCallsCountTrend,
            missedCallsCountTrend,
            cancelledCallsCountTrend,
            abandonedCallsCountTrend,
            callbackRequestedCallsCountTrend,
            averageWaitTimeTrend,
            averageTalkTimeTrend,
        }
    }, [
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        unansweredCallsCountTrend,
        missedCallsCountTrend,
        cancelledCallsCountTrend,
        abandonedCallsCountTrend,
        callbackRequestedCallsCountTrend,
        averageWaitTimeTrend,
        averageTalkTimeTrend,
    ])

    const isLoading = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    return {
        ...saveReport(exportableData, cleanStatsFilters.period),
        isLoading,
    }
}
