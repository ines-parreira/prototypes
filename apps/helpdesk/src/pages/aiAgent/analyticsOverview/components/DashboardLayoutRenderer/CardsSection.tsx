import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { ShowMoreList } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import { MetricsConfigurator } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutSection,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type CardsSectionProps = {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsChartType>
    dashboardId: ManagedDashboardId
    layoutConfig: DashboardLayoutConfig
    tabId: ManagedDashboardsTabId
    tabName: string
}

export const CardsSection = ({
    section,
    reportConfig,
    dashboardId,
    layoutConfig,
    tabId,
    tabName,
}: CardsSectionProps) => {
    const { value: isAnalyticsDashboardsTrendCardsEnabled } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)

    const visibleItems = section.items.filter(
        (item) =>
            item.visibility &&
            (!item.requiresFeatureFlag ||
                isAnalyticsDashboardsTrendCardsEnabled),
    )

    const keyKpisConfig: MetricConfigItem[] = section.items.map((item) => ({
        id: item.chartId,
        label: reportConfig.charts[item.chartId].label,
        visibility: item.visibility,
    }))

    return isAnalyticsDashboardsTrendCardsEnabled ? (
        <>
            <MetricsConfigurator
                metrics={keyKpisConfig}
                dashboardId={dashboardId}
                currentLayoutConfig={layoutConfig}
                tabId={tabId}
                tabName={tabName}
            />
            <ShowMoreList containerClassName={css.kpisSection}>
                {visibleItems.map((item) => (
                    <div
                        key={`${tabId}-${item.chartId}`}
                        className={css.kpiItem}
                    >
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                        />
                    </div>
                ))}
            </ShowMoreList>
        </>
    ) : (
        <div className={css.kpisSection}>
            {visibleItems.map((item) => (
                <div key={`${tabId}-${item.chartId}`} className={css.kpiItem}>
                    <DashboardComponent
                        chart={item.chartId}
                        config={reportConfig}
                    />
                </div>
            ))}
        </div>
    )
}
