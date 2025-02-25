import { useMemo } from 'react'

import { getCsvFileNameWithDates } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { Period } from 'models/stat/types'
import { formatMetricValue } from 'pages/stats/common/utils'
import {
    AVERAGE_TALK_TIME_METRIC_TITLE,
    AVERAGE_WAIT_TIME_METRIC_TITLE,
    INBOUND_CALLS_METRIC_TITLE,
    MISSED_CALLS_METRIC_TITLE,
    OUTBOUND_CALLS_METRIC_TITLE,
    TOTAL_CALLS_METRIC_TITLE,
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

export interface VoiceReportData {
    averageWaitTimeTrend: MetricTrend
    averageTalkTimeTrend: MetricTrend
    totalCallsCountTrend: MetricTrend
    outboundCallsCountTrend: MetricTrend
    inboundCallsCountTrend: MetricTrend
    missedCallsCountTrend: MetricTrend
}

export const saveReport = (data: VoiceReportData, period: Period) => {
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
            MISSED_CALLS_METRIC_TITLE,
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

export const useVoiceOverviewReportData = () => {
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
        ...saveReport(exportableData, cleanStatsFilters.period),
        isLoading,
    }
}
