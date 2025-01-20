import React, {useMemo} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import Button from 'pages/common/components/button/Button'
import {
    DOWNLOAD_BUTTON_TITLE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {VoiceCallAverageTimeMetric} from 'pages/stats/voice/models/types'

import {saveReport} from 'services/reporting/voiceOverviewReportingService'

export const VoiceOverviewDownloadDataButton = () => {
    const {cleanStatsFilters, userTimezone} = useNewVoiceStatsFilters()

    const averageWaitTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.WaitTime,
        cleanStatsFilters,
        userTimezone
    )
    const averageTalkTimeTrend = useVoiceCallAverageTimeTrend(
        VoiceCallAverageTimeMetric.TalkTime,
        cleanStatsFilters,
        userTimezone
    )
    const totalCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone
    )
    const outboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.outboundCalls
    )
    const inboundCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls
    )
    const missedCallsCountTrend = useVoiceCallCountTrend(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.missedCalls
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

    const loadingDownload = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    const onClick = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })
        await saveReport(exportableData, cleanStatsFilters.period)
    }

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={onClick}
            isDisabled={loadingDownload}
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
