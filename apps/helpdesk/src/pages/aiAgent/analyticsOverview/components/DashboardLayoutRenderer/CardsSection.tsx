import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { ShowMoreList } from '@repo/reporting'
import type { MetricConfigItem } from '@repo/reporting'

import { Box } from '@gorgias/axiom'

import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
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
    const { value: isCustomDashboardsEnabled } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsCustomDashboards,
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
        <Box display="flex" flexDirection="column" gap="xs">
            <MetricsConfigurator
                metrics={keyKpisConfig}
                dashboardId={dashboardId}
                currentLayoutConfig={layoutConfig}
                tabId={tabId}
                tabName={tabName}
            />
            <ShowMoreList key={tabId}>
                {visibleItems.map((item) => (
                    <Box
                        key={`${tabId}-${item.chartId}`}
                        flex="1 1 calc(25% - 16px)"
                        minWidth="240px"
                        display="block"
                    >
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                            withChartMenu={isCustomDashboardsEnabled}
                        />
                    </Box>
                ))}
            </ShowMoreList>
        </Box>
    ) : (
        <Box display="flex" flexWrap="wrap" gap="md" width="100%">
            {visibleItems.map((item) => (
                <Box
                    key={`${tabId}-${item.chartId}`}
                    flex="1 1 calc(25% - 16px)"
                    minWidth="240px"
                >
                    <DashboardComponent
                        chart={item.chartId}
                        config={reportConfig}
                        withChartMenu={isCustomDashboardsEnabled}
                    />
                </Box>
            ))}
        </Box>
    )
}
