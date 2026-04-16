import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadPerformanceBreakdownV2Data } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadPerformanceBreakdownV2Data'

export const DownloadPerformanceBreakdownV2Button = () => {
    const { files, fileName, isLoading } =
        useDownloadPerformanceBreakdownV2Data()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="performance-breakdown"
        />
    )
}
