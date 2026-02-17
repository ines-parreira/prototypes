import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { useDownloadAgentsPerformanceData } from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsPerformanceData'
import { DOWNLOAD_BUTTON_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'

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
            title={DOWNLOAD_BUTTON_TITLES.AGENT_PERFORMANCE}
        />
    )
}
