import { useMemo } from 'react'

import { Box } from '@gorgias/axiom'

import { useListManagedDashboards } from 'domains/reporting/hooks/managed-dashboards/useListManagedDashboards'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import { KpisSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/KpisSection'
import { useDashboardConfig } from 'pages/aiAgent/analyticsOverview/hooks/useDashboardConfig'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutItem,
    LayoutSection,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type DashboardLayoutRendererProps<TChart extends string> = {
    defaultLayoutConfig: DashboardLayoutConfig
    reportConfig: ReportConfig<TChart>
    tabKey?: string
    dashboardId?: string
}

const renderSection =
    (
        reportConfig: ReportConfig<AnalyticsChartType>,
        tabKey: string | undefined,
        dashboardId: string | undefined,
        layoutConfig: DashboardLayoutConfig,
    ) =>
    (section: LayoutSection) => {
        const isChartsSection = section.type === 'charts'
        const isKpisSection = section.type === 'kpis'
        const isTableSection = section.type === 'table'

        if (isKpisSection) {
            return (
                <KpisSection
                    key={section.id}
                    section={section}
                    reportConfig={reportConfig}
                    tabKey={tabKey}
                    dashboardId={dashboardId}
                    layoutConfig={layoutConfig}
                />
            )
        }

        return (
            <Box
                key={section.id}
                display="flex"
                gap="md"
                width="100%"
                minWidth="0px"
                flexWrap={isChartsSection ? 'wrap' : undefined}
            >
                {section.items.map((item: LayoutItem) => (
                    <Box
                        key={item.chartId}
                        flex={1}
                        minWidth={
                            isChartsSection
                                ? '300px'
                                : isTableSection
                                  ? '0px'
                                  : undefined
                        }
                    >
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                        />
                    </Box>
                ))}
            </Box>
        )
    }

export const DashboardLayoutRenderer = ({
    defaultLayoutConfig,
    reportConfig,
    tabKey,
    dashboardId,
}: DashboardLayoutRendererProps<string>) => {
    const { data } = useListManagedDashboards()

    const savedDashboard = useMemo(
        () => data.find((dashboard) => dashboard.id === dashboardId),
        [data, dashboardId],
    )

    const { layoutConfig } = useDashboardConfig(
        defaultLayoutConfig,
        savedDashboard,
    )

    return (
        <Box
            display="flex"
            flexDirection="column"
            p="lg"
            gap="lg"
            minWidth="0px"
            className={css.container}
        >
            {layoutConfig.sections.map(
                renderSection(reportConfig, tabKey, dashboardId, layoutConfig),
            )}
        </Box>
    )
}
