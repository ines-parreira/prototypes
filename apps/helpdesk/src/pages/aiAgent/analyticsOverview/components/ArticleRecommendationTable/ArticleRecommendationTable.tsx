import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import { DownloadArticleRecommendationButton } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton'
import { useArticleRecommendationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'

export const ArticleRecommendationTable = () => {
    const {
        data = [],
        loadingStates,
        displayNames,
    } = useArticleRecommendationMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ARTICLE_RECOMMENDATION_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadArticleRecommendationButton />}
            nameColumn={{
                accessor: 'entity',
                label: 'Article name',
                displayNames,
                getHref: (entity) => entity,
            }}
        />
    )
}
