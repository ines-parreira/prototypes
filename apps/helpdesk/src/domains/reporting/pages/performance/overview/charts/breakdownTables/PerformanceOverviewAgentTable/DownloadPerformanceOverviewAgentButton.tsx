import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadPerformanceOverviewAgentButton = () => {
    const { files, fileName, isLoading } =
        useDownloadPerformanceOverviewAgentData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="performance-overview_agent-breakdown-table"
        />
    )
}
