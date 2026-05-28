import { useDownloadAiAgentSalesPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentSalesPerformanceByChannelData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_sales-agent_channel-performance-table' as const

export const useDownloadAiAgentSalesPerformanceByChannelAction = () => {
    const { files, fileName, isLoading } =
        useDownloadAiAgentSalesPerformanceByChannelData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadAiAgentSalesPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAiAgentSalesPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
