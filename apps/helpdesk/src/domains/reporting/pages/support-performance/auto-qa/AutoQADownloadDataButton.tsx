import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useAutoQAReportData } from 'domains/reporting/services/autoQAReportingService'

const DOWNLOAD_BUTTON_TITLE = 'AutoQA Report Data'

export const AutoQADownloadDataButton = () => {
    const { files, fileName, isLoading } = useAutoQAReportData()

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
