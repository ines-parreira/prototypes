import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import { DownloadArticleRecommendationButton } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton'
import { useArticleRecommendationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const ArticleRecommendationTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const {
        data = [],
        loadingStates,
        displayNames,
    } = useArticleRecommendationMetrics()

    const nameColumns = useMemo(
        () => [
            {
                accessor: 'entity',
                label: 'Article name',
                displayNames,
                getHref: (entity: string) => entity,
            },
        ],
        [displayNames],
    )

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ARTICLE_RECOMMENDATION_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadArticleRecommendationButton />}
            nameColumns={nameColumns}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Article Recommendation"
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
