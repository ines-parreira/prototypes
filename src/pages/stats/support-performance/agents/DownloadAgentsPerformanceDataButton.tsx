import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useDownloadAgentsPerformanceData } from 'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Agents Performance Data'

export const DownloadAgentsPerformanceDataButton = () => {
    const { files, fileName, isLoading } = useDownloadAgentsPerformanceData()

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
