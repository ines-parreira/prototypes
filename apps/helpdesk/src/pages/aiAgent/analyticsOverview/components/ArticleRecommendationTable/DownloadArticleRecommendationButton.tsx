import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadArticleRecommendationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadArticleRecommendationData'

const SEGMENT_EVENT_NAME =
    'ai-agent_overview_article-recommendation-table' as const

export const useDownloadArticleRecommendationAction = () => {
    const { files, fileName, isLoading } =
        useDownloadArticleRecommendationData()
    return useDownloadTableAction({
        files,
        fileName,
        isLoading,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
}

export const DownloadArticleRecommendationButton = () => {
    const { files, fileName, isLoading } =
        useDownloadArticleRecommendationData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName={SEGMENT_EVENT_NAME}
        />
    )
}
