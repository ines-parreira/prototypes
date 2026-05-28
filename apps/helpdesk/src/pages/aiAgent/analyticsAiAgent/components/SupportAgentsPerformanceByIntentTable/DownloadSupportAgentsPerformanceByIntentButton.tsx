import { useDownloadSupportAgentsPerformanceByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentsPerformanceByIntentData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_support-agent_intent-breakdown-table' as const

export const useDownloadSupportAgentsPerformanceByIntentAction = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByIntentData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadSupportAgentsPerformanceByIntentButton = () => {
    const { files, fileName, isLoading } =
        useDownloadSupportAgentsPerformanceByIntentData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
