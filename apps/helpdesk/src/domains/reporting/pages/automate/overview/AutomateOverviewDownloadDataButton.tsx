import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useAutomateOverviewReportData } from 'domains/reporting/services/automateOverviewReportingService'

const DOWNLOAD_AUTOMATE_DATA_BUTTON_TITLE = 'Download data'

export const AutomateOverviewDownloadDataButton = () => {
    const { files, fileName, isLoading } = useAutomateOverviewReportData()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={DOWNLOAD_AUTOMATE_DATA_BUTTON_TITLE}
        />
    )
}
