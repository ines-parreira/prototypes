import React from 'react'
import {logEvent, SegmentEvent} from 'common/segment'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {useVoiceAgentsMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsMetrics'
import {saveReport} from 'services/reporting/voiceAgentsReportingService'
import {useVoiceAgentsSummaryMetrics} from 'pages/stats/voice/hooks/useVoiceAgentsSummaryMetrics'
import {
    DOWNLOAD_BUTTON_TITLE,
    DOWNLOAD_DATA_BUTTON_LABEL,
} from 'pages/stats/voice/constants/voiceAgents'

export const VoiceAgentsDownloadDataButton = () => {
    const {reportData, isLoading, period} = useVoiceAgentsMetrics()
    const {summaryData, isLoading: summaryIsLoading} =
        useVoiceAgentsSummaryMetrics()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(reportData, summaryData, period)
            }}
            isDisabled={isLoading || summaryIsLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
