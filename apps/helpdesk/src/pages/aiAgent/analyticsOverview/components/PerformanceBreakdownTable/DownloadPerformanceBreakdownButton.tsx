import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadPerformanceBreakdownData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownData'

export const DownloadPerformanceBreakdownButton = () => {
    const { files, fileName, isLoading } = useDownloadPerformanceBreakdownData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="performance-breakdown"
        />
    )
}
