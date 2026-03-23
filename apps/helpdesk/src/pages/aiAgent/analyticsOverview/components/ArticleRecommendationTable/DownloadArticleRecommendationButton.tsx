import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownloadArticleRecommendationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadArticleRecommendationData'

export const DownloadArticleRecommendationButton = () => {
    const { files, fileName, isLoading } =
        useDownloadArticleRecommendationData()

    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="ai-agent_overview_article-recommendation-table"
        />
    )
}
