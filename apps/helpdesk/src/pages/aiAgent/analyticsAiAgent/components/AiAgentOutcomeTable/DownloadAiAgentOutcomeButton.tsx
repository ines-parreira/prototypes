import { useDownloadAiAgentOutcomeData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentOutcomeData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME = 'ai-agent_all-agents_ai-agent-outcome-table' as const

export const useDownloadAiAgentOutcomeAction = () => {
    const { files, fileName, isLoading } = useDownloadAiAgentOutcomeData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadAiAgentOutcomeButton = () => {
    const { files, fileName, isLoading } = useDownloadAiAgentOutcomeData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
