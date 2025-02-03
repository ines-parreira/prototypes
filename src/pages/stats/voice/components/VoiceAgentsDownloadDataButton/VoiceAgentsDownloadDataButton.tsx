import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {DownloadDataButton} from 'pages/stats/support-performance/components/DownloadDataButton'

import {DOWNLOAD_BUTTON_TITLE} from 'pages/stats/voice/constants/voiceAgents'
import {useVoiceAgentsReportData} from 'services/reporting/voiceAgentsReportingService'
import {saveZippedFiles} from 'utils/file'

export const VoiceAgentsDownloadDataButton = () => {
    const {files, fileName, isLoading} = useVoiceAgentsReportData()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
