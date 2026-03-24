import { useDownloadAllAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadAllAgentsPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_all-agents_channel-performance-table"
        />
    )
}
