import { useDownloadAllAgentsPerformanceByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByIntentData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadAllAgentsPerformanceByIntentButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByIntentData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_all-agents_intent-breakdown-table"
        />
    )
}
