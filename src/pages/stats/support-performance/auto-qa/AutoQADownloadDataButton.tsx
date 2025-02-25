import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { useAutoQAReportData } from 'services/reporting/autoQAReportingService'
import { saveZippedFiles } from 'utils/file'

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
