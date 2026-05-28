import { useDownloadSupportAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByChannelData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_support-agent_channel-performance-table' as const

export const useDownloadSupportAgentsPerformanceByChannelAction = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByChannelData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadSupportAgentsPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
