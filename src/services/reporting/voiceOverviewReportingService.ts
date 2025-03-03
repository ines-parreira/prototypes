import { useMemo } from 'react'

import { getCsvFileNameWithDates } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { Period } from 'models/stat/types'
import { formatMetricValue } from 'pages/stats/common/utils'
import {
    ABANDONED_CALLS_METRIC_TITLE,
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    CANCELLED_CALLS_METRIC_TITLE,
    DEPRECATED_MISSED_CALLS_METRIC_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
    UNANSWERED_CALLS_METRIC_TITLE,
    VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
    VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
    VOICE_OVERVIEW_REPORT_FILE_NAME,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallAverageTimeTrend } from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { VoiceCallAverageTimeMetric } from 'pages/stats/voice/models/types'
import {
    CURRENT_PERIOD_LABEL,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import { createCsv } from 'utils/file'

interface DEPRECATED_VoiceReportData {
    averageWaitTimeTrend: MetricTrend
    averageTalkTimeTrend: MetricTrend
    totalCallsCountTrend: MetricTrend
    outboundCallsCountTrend: MetricTrend
    inboundCallsCountTrend: MetricTrend
    missedCallsCountTrend: MetricTrend
}

export const DEPRECATED_saveReport = (
    data: DEPRECATED_VoiceReportData,
    period: Period,
) => {
    const {
        averageWaitTimeTrend,
        averageTalkTimeTrend,
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        missedCallsCountTrend,
    } = data

    const formatValue = (value?: number | null) =>
        value ? formatMetricValue(value) : NOT_AVAILABLE_LABEL

    const callerExperienceData = [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AVERAGE_WAIT_TIME_METRIC_TITLE,
            formatValue(averageWaitTimeTrend.data?.value),
            formatValue(averageWaitTimeTrend.data?.prevValue),
        ],
        [
            AVERAGE_TALK_TIME_METRIC_TITLE,
            formatValue(averageTalkTimeTrend.data?.value),
            formatValue(averageTalkTimeTrend.data?.prevValue),
        ],
    ]
    const callVolumeData = [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            TOTAL_CALLS_METRIC_TITLE,
            totalCallsCountTrend.data?.value,
            totalCallsCountTrend.data?.prevValue,
        ],
        [
            OUTBOUND_CALLS_METRIC_TITLE,
            outboundCallsCountTrend.data?.value,
            outboundCallsCountTrend.data?.prevValue,
        ],
        [
            INBOUND_CALLS_METRIC_TITLE,
            inboundCallsCountTrend.data?.value,
            inboundCallsCountTrend.data?.prevValue,
        ],
        [
            DEPRECATED_MISSED_CALLS_METRIC_TITLE,
            missedCallsCountTrend.data?.value,
            missedCallsCountTrend.data?.prevValue,
        ],
    ]

    const downloadFileName = getCsvFileNameWithDates(
        period,
        VOICE_OVERVIEW_REPORT_FILE_NAME,
    )

    return {
        files: {
            [getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
            )]: createCsv(callerExperienceData),
            [getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
            )]: createCsv(callVolumeData),
        },
        fileName: downloadFileName,
    }
}

export const DEPRECATED_useVoiceOverviewReportData = () => {
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()

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
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls,
    )

    const exportableData = useMemo(() => {
        return {
            averageWaitTimeTrend,
            averageTalkTimeTrend,
            totalCallsCountTrend,
            outboundCallsCountTrend,
            inboundCallsCountTrend,
            missedCallsCountTrend,
        }
    }, [
        averageWaitTimeTrend,
        averageTalkTimeTrend,
        totalCallsCountTrend,
        outboundCallsCountTrend,
        inboundCallsCountTrend,
        missedCallsCountTrend,
    ])

    const isLoading = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    return {
        ...DEPRECATED_saveReport(exportableData, cleanStatsFilters.period),
        isLoading,
    }
}

interface VoiceReportData {
    totalCallsCountTrend: MetricTrend
    outboundCallsCountTrend: MetricTrend
    inboundCallsCountTrend: MetricTrend
    unansweredCallsCountTrend: MetricTrend
    missedCallsCountTrend: MetricTrend
    cancelledCallsCountTrend: MetricTrend
    abandonedCallsCountTrend: MetricTrend
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
    const { cleanStatsFilters, userTimezone } = useNewVoiceStatsFilters()

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
