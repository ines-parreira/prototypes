import { useDownloadAiAgentSalesPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentSalesPerformanceByChannelData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadAiAgentSalesPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAiAgentSalesPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_sales-agent_channel-performance-table"
        />
    )
}
