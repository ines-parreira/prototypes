import { logEvent, SegmentEvent } from '@repo/logging'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { DOWNLOAD_BUTTON_TITLE } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsReportData } from 'domains/reporting/services/voiceAgentsReportingService'
import { saveZippedFiles } from 'utils/file'

export const VoiceAgentsDownloadDataButton = () => {
    const { files, fileName, isLoading } = useVoiceAgentsReportData()

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
