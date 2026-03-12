import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { ShowMoreList } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'

import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { AnimatedTrendCard } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/AnimatedTrendCard'
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
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )

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
                {visibleItems.map((item, index) => (
                    <AnimatedTrendCard
                        key={`${tabId}-${item.chartId}`}
                        item={item}
                        index={index}
                        tabId={tabId}
                        reportConfig={reportConfig}
                    />
                ))}
            </ShowMoreList>
        </>
    ) : (
        <div className={css.kpisSection}>
            {visibleItems.map((item, index) => (
                <AnimatedTrendCard
                    key={`${tabId}-${item.chartId}`}
                    item={item}
                    index={index}
                    tabId={tabId}
                    reportConfig={reportConfig}
                />
            ))}
        </div>
    )
}
