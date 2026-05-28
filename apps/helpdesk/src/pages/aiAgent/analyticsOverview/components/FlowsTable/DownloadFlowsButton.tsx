import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadFlowsData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadFlowsData'

const SEGMENT_EVENT_NAME = 'ai-agent_overview_flows-table' as const

export const useDownloadFlowsAction = () => {
    const { files, fileName, isLoading } = useDownloadFlowsData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadFlowsButton = () => {
    const { files, fileName, isLoading } = useDownloadFlowsData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
