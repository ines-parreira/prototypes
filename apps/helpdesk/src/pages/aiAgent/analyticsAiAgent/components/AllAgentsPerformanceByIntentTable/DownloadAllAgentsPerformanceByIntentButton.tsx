import { useDownloadAllAgentsPerformanceByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByIntentData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME = 'ai-agent_all-agents_intent-breakdown-table' as const

export const useDownloadAllAgentsPerformanceByIntentAction = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByIntentData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadAllAgentsPerformanceByIntentButton = () => {
    const { files, fileName, isLoading } =
        useDownloadAllAgentsPerformanceByIntentData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
