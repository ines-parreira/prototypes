import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { useSatisfactionReportData } from 'services/reporting/satisfactionReportingService'
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
