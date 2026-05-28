import { useDownloadShoppingAssistantPerformanceByEngagementFeatureData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantPerformanceByEngagementFeatureData'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'ai-agent_shopping-assistant_engagement-feature-breakdown-table' as const

export const useDownloadShoppingAssistantPerformanceByEngagementFeatureAction =
    () => {
        const { files, fileName, isLoading } =
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData()
        return useDownloadTableAction({
            files,
            fileName,
            isLoading,
            segmentEventName: SEGMENT_EVENT_NAME,
        })
    }

export const DownloadShoppingAssistantPerformanceByEngagementFeatureButton =
    () => {
        const { files, fileName, isLoading } =
            useDownloadShoppingAssistantPerformanceByEngagementFeatureData()

        return (
            <DownloadTableButton
                files={files}
                fileName={fileName}
                isLoading={isLoading}
                segmentEventName={SEGMENT_EVENT_NAME}
            />
        )
    }
