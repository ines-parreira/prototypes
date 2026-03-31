import { useDownloadShoppingAssistantPerformanceByEngagementFeatureData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantPerformanceByEngagementFeatureData'
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

export const DownloadShoppingAssistantPerformanceByEngagementFeatureButton =
    () => {
        const { files, fileName, isLoading } =
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData()

        return (
            <DownloadTableButton
                files={files}
                fileName={fileName}
                isLoading={isLoading}
                segmentEventName="ai-agent_shopping-assistant_engagement-feature-breakdown-table"
            />
        )
    }
