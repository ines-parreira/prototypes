import { useDownloadAllAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_all-agents_channel-performance-table' as const

export const useDownloadAllAgentsPerformanceByChannelAction = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByChannelData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadAllAgentsPerformanceByChannelButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByChannelData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
