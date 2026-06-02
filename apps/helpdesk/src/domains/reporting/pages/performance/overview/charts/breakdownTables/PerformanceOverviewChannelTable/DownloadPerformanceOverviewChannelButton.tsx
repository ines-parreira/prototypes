import { useDownloadPerformanceOverviewChannelData } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadPerformanceOverviewChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadPerformanceOverviewChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="performance-overview_channel-breakdown-table"
        />
    )
}
