import { useCallback } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import type {
    DashboardLayoutConfig,
    LayoutItem,
    LayoutReportConfig,
} from '@repo/reporting'
import { DashboardLayoutRenderer } from '@repo/reporting'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { useIsArticleRecommendationTableVisible } from 'pages/aiAgent/analyticsOverview/hooks/useIsArticleRecommendationTableVisible'
import type {
    AnalyticsChartType,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type Props<TChart extends AnalyticsChartType> = {
    defaultLayoutConfig: DashboardLayoutConfig<TChart>
    reportConfig: LayoutReportConfig<TChart>
    dashboardId: ManagedDashboardId
    tabId: ManagedDashboardsTabId
    tabName: string
    onTableTabChange?: (key: string) => void
}

export function AiAgentDashboardLayoutRenderer<
    TChart extends AnalyticsChartType,
>({
    defaultLayoutConfig,
    reportConfig,
    dashboardId,
    tabId,
    tabName,
    onTableTabChange,
}: Props<TChart>) {
    const { value: enableCustomDashboards } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
    )

    const isArticleRecommendationTableVisible =
        useIsArticleRecommendationTableVisible()

    const isItemVisible = useCallback(
        (item: LayoutItem<TChart>) =>
            (item.chartId as AnalyticsChartType) !==
                AnalyticsOverviewChart.ArticleRecommendationTable ||
            isArticleRecommendationTableVisible,
        [isArticleRecommendationTableVisible],
    )

    return (
        <DashboardLayoutRenderer<TChart>
            defaultLayoutConfig={defaultLayoutConfig}
            reportConfig={reportConfig}
            dashboardId={dashboardId}
            tabId={tabId}
            tabName={tabName}
            DashboardComponent={DashboardComponent}
            onTableTabChange={onTableTabChange}
            enableCustomDashboards={enableCustomDashboards}
            enableTablesPersistence
            isItemVisible={isItemVisible}
        />
    )
}
