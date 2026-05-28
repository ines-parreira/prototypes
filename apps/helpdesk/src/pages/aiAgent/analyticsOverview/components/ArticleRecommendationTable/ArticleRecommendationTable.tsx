import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import {
    DownloadArticleRecommendationButton,
    useDownloadArticleRecommendationAction,
} from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton'
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
    const exportCsvAction = useDownloadArticleRecommendationAction()
    const withMenu = withChartMenu && chartId

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
            DownloadButton={
                !withMenu ? <DownloadArticleRecommendationButton /> : undefined
            }
            nameColumns={nameColumns}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Article Recommendation"
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
