import { Box } from '@gorgias/axiom'

import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { CardsSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/CardsSection'
import { DashboardContext } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext'
import css from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer.less'
import { TablesSection } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/TablesSection'
import type {
    DashboardLayoutConfig,
    LayoutItem,
    LayoutSection,
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

type DashboardLayoutRendererProps = {
    defaultLayoutConfig: DashboardLayoutConfig
    reportConfig: ReportConfig<string>
    dashboardId: ManagedDashboardId
    tabId: ManagedDashboardsTabId
    tabName: string
    onTableTabChange?: (key: ManagedDashboardsTabId) => void
}

const renderSection =
    (
        reportConfig: ReportConfig<string>,
        tabId: ManagedDashboardsTabId,
        dashboardId: ManagedDashboardId,
        layoutConfig: DashboardLayoutConfig,
        tabName: string,
        onTableTabChange: ((key: ManagedDashboardsTabId) => void) | undefined,
    ) =>
    (section: LayoutSection) => {
        const isChartsSection = section.type === ChartType.Graph
        const isCardsSection = section.type === ChartType.Card
        const isTableSection = section.type === ChartType.Table

        if (isTableSection) {
            return (
                <TablesSection
                    key={`${tabId}-${section.id}`}
                    section={section}
                    reportConfig={reportConfig}
                    onTabChange={onTableTabChange}
                />
            )
        }

        if (isCardsSection) {
            return (
                <CardsSection
                    key={section.id}
                    section={section}
                    reportConfig={reportConfig}
                    tabId={tabId}
                    dashboardId={dashboardId}
                    layoutConfig={layoutConfig}
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
                        minWidth={isChartsSection ? '300px' : undefined}
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
    dashboardId,
    tabId,
    tabName,
    onTableTabChange,
}: DashboardLayoutRendererProps) => {
    const { layoutConfig, isLoading } = useGetManagedDashboardsLayoutConfig({
        dashboardId,
        defaultLayoutConfig,
        tabId,
    })

    return (
        <DashboardContext.Provider
            value={{
                dashboardId,
                tabId,
                tabName,
                layoutConfig,
                isLoaded: !isLoading,
            }}
        >
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
                        tabId,
                        dashboardId,
                        layoutConfig,
                        tabName,
                        onTableTabChange,
                    ),
                )}
            </Box>
        </DashboardContext.Provider>
    )
}
