import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_shopping-assistant_top-products-table' as const

export const useDownloadShoppingAssistantTopProductsAction = () => {
    const { files, fileName, isLoading } =
        useDownloadShoppingAssistantTopProductsData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadShoppingAssistantTopProductsButton = () => {
    const { files, fileName, isLoading } =
        useDownloadShoppingAssistantTopProductsData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
