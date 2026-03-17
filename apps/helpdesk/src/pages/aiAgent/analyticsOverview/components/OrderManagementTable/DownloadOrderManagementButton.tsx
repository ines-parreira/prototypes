import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadOrderManagementData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData'

export const DownloadOrderManagementButton = () => {
    const { files, fileName, isLoading } = useDownloadOrderManagementData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_overview_order-management-table"
        />
    )
}
