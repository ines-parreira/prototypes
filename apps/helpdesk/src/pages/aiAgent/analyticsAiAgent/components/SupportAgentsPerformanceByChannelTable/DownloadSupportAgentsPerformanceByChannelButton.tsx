import { useDownloadSupportAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByChannelData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadSupportAgentsPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_support-agent_channel-performance-table"
        />
    )
}
