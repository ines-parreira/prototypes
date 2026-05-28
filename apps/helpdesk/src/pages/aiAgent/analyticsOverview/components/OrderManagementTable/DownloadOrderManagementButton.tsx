import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadOrderManagementData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData'

const SEGMENT_EVENT_NAME = 'ai-agent_overview_order-management-table' as const

export const useDownloadOrderManagementAction = () => {
    const { files, fileName, isLoading } = useDownloadOrderManagementData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadOrderManagementButton = () => {
    const { files, fileName, isLoading } = useDownloadOrderManagementData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
