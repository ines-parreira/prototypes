import { logEvent, SegmentEvent } from 'common/segment'
import { useAIAgentReportMetrics } from 'hooks/reporting/automate/useAIAgentReportMetrics'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
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
