import { logEvent, SegmentEvent } from '@repo/logging'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useSatisfactionReportData } from 'domains/reporting/services/satisfactionReportingService'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_SATISFACTION_DATA_BUTTON_TITLE = 'Download Satisfaction data'

export const SatisfactionDownloadDataButton = () => {
    const { files, fileName, isLoading } = useSatisfactionReportData()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={DOWNLOAD_SATISFACTION_DATA_BUTTON_TITLE}
        />
    )
}
