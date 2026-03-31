import { useDownloadSupportAgentsPerformanceByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByIntentData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadSupportAgentsPerformanceByIntentButton = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByIntentData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_support-agent_intent-breakdown-table"
        />
    )
}
