import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { DOWNLOAD_BUTTON_TITLE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceOverviewReportData } from 'domains/reporting/services/voiceOverviewReportingService'

export const VoiceOverviewDownloadDataButton = () => {
    const { files, fileName, isLoading } = useVoiceOverviewReportData()

    const onClick = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })
        await saveZippedFiles(files, fileName)
    }

    return (
        <DownloadDataButton
            onClick={onClick}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
