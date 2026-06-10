import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import {
    DownloadArticleRecommendationButton,
    useDownloadArticleRecommendationAction,
} from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton'
import { useArticleRecommendationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const ArticleRecommendationTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const {
        data = [],
        loadingStates,
        displayNames,
    } = useArticleRecommendationMetrics()
    const exportCsvAction = useDownloadArticleRecommendationAction()
    const withMenu = withChartMenu && chartId
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

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
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
