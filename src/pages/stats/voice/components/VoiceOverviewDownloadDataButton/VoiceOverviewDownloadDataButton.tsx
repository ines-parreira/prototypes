import { logEvent, SegmentEvent } from 'common/segment'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { DOWNLOAD_BUTTON_TITLE } from 'pages/stats/voice/constants/voiceOverview'
import { useVoiceOverviewReportData } from 'services/reporting/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'

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
