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
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type CardsSectionProps = {
    section: LayoutSection
    reportConfig: ReportConfig<AnalyticsChartType>
    tabKey?: string
    dashboardId?: string
    layoutConfig: DashboardLayoutConfig
}

export const CardsSection = ({
    section,
    reportConfig,
    tabKey,
    dashboardId,
    layoutConfig,
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
            {dashboardId && (
                <MetricsConfigurator
                    metrics={keyKpisConfig}
                    dashboardId={dashboardId}
                    currentLayoutConfig={layoutConfig}
                />
            )}
            <ShowMoreList containerClassName={css.kpisSection}>
                {visibleItems.map((item, index) => (
                    <AnimatedTrendCard
                        key={
                            tabKey ? `${tabKey}-${item.chartId}` : item.chartId
                        }
                        item={item}
                        index={index}
                        tabKey={tabKey}
                        reportConfig={reportConfig}
                    />
                ))}
            </ShowMoreList>
        </>
    ) : (
        <div className={css.kpisSection}>
            {visibleItems.map((item, index) => (
                <AnimatedTrendCard
                    key={tabKey ? `${tabKey}-${item.chartId}` : item.chartId}
                    item={item}
                    index={index}
                    tabKey={tabKey}
                    reportConfig={reportConfig}
                />
            ))}
        </div>
    )
}
