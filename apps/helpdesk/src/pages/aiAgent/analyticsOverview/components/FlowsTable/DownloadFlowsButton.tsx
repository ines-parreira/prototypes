import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadFlowsData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadFlowsData'

export const DownloadFlowsButton = () => {
    const { files, fileName, isLoading } = useDownloadFlowsData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_overview_flows-table"
        />
    )
}
