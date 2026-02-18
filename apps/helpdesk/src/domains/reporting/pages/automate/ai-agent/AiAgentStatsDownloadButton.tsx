import { logEvent, SegmentEvent } from '@repo/logging'

import { useAIAgentReportMetrics } from 'domains/reporting/hooks/automate/useAIAgentReportMetrics'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download AI Agent Data'

export const AiAgentStatsDownloadButton = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const { files, fileName, isLoading } = useAIAgentReportMetrics(
        selectedCustomFieldId,
    )

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
