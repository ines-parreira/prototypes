import { Box } from '@gorgias/axiom'

import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { CardsSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/CardsSection'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import type {
    AnalyticsChartType,
    DashboardLayoutConfig,
    LayoutItem,
    LayoutSection,
    ManagedDashboardId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type DashboardLayoutRendererProps<TChart extends string> = {
    defaultLayoutConfig: DashboardLayoutConfig
    reportConfig: ReportConfig<TChart>
    tabKey?: string
    dashboardId: ManagedDashboardId
    tabId?: string
    tabName?: string
}

const renderSection =
    (
        reportConfig: ReportConfig<AnalyticsChartType>,
        tabKey: string | undefined,
        dashboardId: string | undefined,
        layoutConfig: DashboardLayoutConfig,
        tabId: string,
        tabName: string,
    ) =>
    (section: LayoutSection) => {
        const isChartsSection = section.type === ChartType.Graph
        const isCardsSection = section.type === ChartType.Card
        const isTableSection = section.type === ChartType.Table

        if (isCardsSection) {
            return (
                <CardsSection
                    key={section.id}
                    section={section}
                    reportConfig={reportConfig}
                    tabKey={tabKey}
                    dashboardId={dashboardId}
                    layoutConfig={layoutConfig}
                    tabId={tabId}
                    tabName={tabName}
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
    tabId = 'tab_main',
    tabName = 'Main',
}: DashboardLayoutRendererProps<string>) => {
    const layoutConfig = useGetManagedDashboardsLayoutConfig({
        dashboardId,
        defaultLayoutConfig,
        tabId,
    })

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
                renderSection(
                    reportConfig,
                    tabKey,
                    dashboardId,
                    layoutConfig,
                    tabId,
                    tabName,
                ),
            )}
        </Box>
    )
}
