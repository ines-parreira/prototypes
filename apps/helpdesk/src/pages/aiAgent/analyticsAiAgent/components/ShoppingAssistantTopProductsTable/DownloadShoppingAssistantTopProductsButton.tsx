import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadShoppingAssistantTopProductsButton = () => {
    const { files, fileName, isLoading } =
        useDownloadShoppingAssistantTopProductsData()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_shopping-assistant_top-products-table"
        />
    )
}
